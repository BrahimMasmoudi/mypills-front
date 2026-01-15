import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { Medication } from './types/medication'
import { toMedicationDto } from './utils/mapper'
import { GetMedicationDetailsResponse } from './types/medicationApi'
import { getMessaging } from 'firebase-admin/messaging'
import { addDays, isBefore, isSameDay, parse, format } from 'date-fns'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { CloudTasksClient } from '@google-cloud/tasks'
import { fromZonedTime } from 'date-fns-tz'

initializeApp()
export * from './infrastructure/entry-points/https-functions'
export * from './infrastructure/config/firebase'
const firestore = getFirestore()
const client = new CloudTasksClient()

const database = firestore.collection('medications')
const tunisianMedications = firestore.collection('tunisian_meds')

export const deletePills = onCall({ region: 'europe-west3' }, async ({ data }) => {
    const medication = data.medication as Medication
    return await database.doc(medication.medicationId).delete()
})

export const updateMedicationName = onCall({ region: 'europe-west3' }, async ({ data }) => {
    const medication = data.medication as Medication
    const newName = data.newName as string
    return await database.doc(medication.medicationId).update({ 'name': newName })
})

export const setExpiredStatus = onCall({ region: 'europe-west3' }, async ({ data }) => {
    const medicationIds = data.medicationIds as string[]

    if (!medicationIds || medicationIds.length === 0) {
        return { updated: 0 }
    }

    try {
        // Process in batches of 500 (Firestore limit)
        const batchSize = 500
        let totalUpdated = 0

        for (let i = 0; i < medicationIds.length; i += batchSize) {
            const batch = firestore.batch()
            const batchIds = medicationIds.slice(i, i + batchSize)

            for (const id of batchIds) {
                const docRef = database.doc(id)
                batch.update(docRef, { expired: true })
            }

            await batch.commit()
            totalUpdated += batchIds.length
        }
        return { updated: totalUpdated }
    } catch (error) {
        console.error('Error updating expired status:', error)
        throw error
    }
})

// -- CIP13 to CIS Migration and Lookup --

export const getMedicationDetails = onCall({ region: 'europe-west3' }, async ({ data }): Promise<GetMedicationDetailsResponse> => {
    const cip13 = data.cip13 as string
    if (!cip13) {
        throw new HttpsError('invalid-argument', 'CIP13 is required')
    }

    // Bypass SSL validation in emulator
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    try {
        // 1. Lookup CIS from Firestore
        const docSnap = await firestore.collection('cip_to_cis').doc(cip13).get()

        if (!docSnap.exists) {
            console.warn(`CIP13 ${cip13} not found in DB`)
            throw new HttpsError('not-found', 'Medication not found in database')
        }

        const cis = docSnap.data()?.cis
        if (!cis) {
            throw new HttpsError('not-found', 'CIS code not found for this medication')
        }

        // 2. Fetch details from Giygas API
        // Note: fetch is available globally in Node 18+ (Firebase Functions Node 20 environment)
        // If not, we might need axios or node-fetch, but let's try native fetch first.
        const response = await fetch(`https://medicaments-api.giygas.dev/medicament/id/${cis}`)

        if (!response.ok) {
            console.warn(`Giygas API failed for CIS ${cis}: ${response.statusText}`)
            throw new HttpsError('not-found', 'Medication details not available from external API')
        }

        const apiDetails = await response.json()

        const mappedDetails = toMedicationDto(apiDetails)

        // Return only the name for now as per requirements, or the whole object
        const name = apiDetails.elementPharmaceutique || apiDetails.denomination || ''

        return {
            name,
            cis,
            details: mappedDetails,
        }
    } catch (e: any) {
        // Re-throw HttpsError as-is
        if (e instanceof HttpsError) {
            throw e
        }
        console.error('getMedicationDetails error:', e)
        throw new HttpsError('internal', 'Failed to retrieve medication details')
    }
})

export const scheduleReminderTask = onDocumentCreated({
    document: 'reminders/{id}',
    region: 'europe-west3',
}, async (event) => {
    const data = event.data?.data()
    if (!data) return

    const project = process.env.GCLOUD_PROJECT!
    const location = 'europe-west3'
    const queue = 'reminder'

    const serviceAccountEmail = `${project}@appspot.gserviceaccount.com`

    const queuePath = client.queuePath(project, location, queue)

    const task = {
        httpRequest: {
            httpMethod: 'POST' as const,
            url: `https://${location}-${project}.cloudfunctions.net/sendFCMNotification`,

            body: Buffer.from(JSON.stringify({
                userId: data.userId,
                medName: data.medName,
                quantity: data.quantity || '1',
            })).toString('base64'),

            headers: { 'Content-Type': 'application/json' },

            oidcToken: {
                serviceAccountEmail: serviceAccountEmail,
            },
        },
        scheduleTime: { seconds: data.scheduledTime.seconds },
    }

    await client.createTask({ parent: queuePath, task })
})

export const createSchedule = onCall({ region: 'europe-west3' }, async (request) => {
    const { medication, startDate, endDate, doses, timezone } = request.data

    const batch = firestore.batch()
    let currentDate = parse(startDate, 'yyyy-MM-dd', new Date())
    const end = parse(endDate, 'yyyy-MM-dd', new Date())

    while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
        doses.forEach((dose: any) => {
            if (!dose.time) return

            const datePart = format(currentDate, 'yyyy-MM-dd')
            const timePart = dose.time

            const dateTimeString = `${datePart} ${timePart}`
            const scheduledTime = fromZonedTime(dateTimeString, timezone)

            const reminderRef = firestore.collection('reminders').doc()
            batch.set(reminderRef, {
                userId: request.auth?.uid,
                medName: medication.name,
                quantity: dose.quantity,
                scheduledTime: Timestamp.fromDate(scheduledTime),
                status: 'pending',
            })
        })
        currentDate = addDays(currentDate, 1)
    }

    await batch.commit()
    return { success: true }
})

export const sendFCMNotification = onRequest({ region: 'europe-west3' }, async (req, res) => {
    const { userId, medName, quantity } = req.body

    try {
        const userDoc = await firestore.collection('users').doc(userId).get()
        const userData = userDoc.data()

        if (!userData?.fcmToken) {
            console.error(`No FCM token found for user: ${userId}`)
            res.status(200).send('No token available')
            return
        }

        const message = {
            token: userData.fcmToken,
            data: {
                medName: medName,
                quantity: String(quantity),
            },
        }

        await getMessaging().send(message)
        res.status(200).send('Notification sent')
    } catch (error) {
        res.status(500).send(error)
    }
})

export const saveUserToken = onCall({ region: 'europe-west3' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.')
    }

    const fcmToken = request.data.fcmToken
    const uid = request.auth.uid

    try {
        // We use set with { merge: true } so we don't overwrite
        // other user data (like their name or email)
        await firestore.collection('users').doc(uid).set({
            fcmToken: fcmToken,
            lastUpdated: new Date().toISOString(),
            userId: uid, // Good for querying later
        }, { merge: true })

        return { success: true }
    } catch (error) {
        throw new HttpsError('internal', 'Failed to save token')
    }
})

export const searchTunisianMeds = onCall({ region: 'europe-west3' }, async (request) => {
    const searchText = request.data.query || ''

    if (!searchText || searchText.length < 2) {
        return []
    }

    const searchTerm = searchText.toUpperCase()

    try {
        const snapshot = await tunisianMedications
            .where('name', '>=', searchTerm)
            .where('name', '<=', searchTerm + '\uf8ff')
            .limit(10)
            .get()

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
    } catch (error) {
        console.error('Search error:', error)
        throw new HttpsError('internal', 'Search failed')
    }
})

// const createData = async () => {
//     const backup = {
//         "3TrUX0JMrWhqL9koMStx": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1735686000,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "RESPIWELL",
//             "bareCode": "",
//             "medicationId": "3TrUX0JMrWhqL9koMStx",
//             "image": "pill-1"
//
//         },
//         "4GJqkhgMCGpJw3uz5L8C": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1704063600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Anesderm",
//             "bareCode": "",
//             "medicationId": "4GJqkhgMCGpJw3uz5L8C",
//             "image": "pill-2"
//
//         },
//         "5hMTyfWQRo1vZkMcIDFI": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1730415600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "ALLERGICA",
//             "bareCode": "",
//             "medicationId": "5hMTyfWQRo1vZkMcIDFI",
//             "image": "pill-3"
//
//         },
//         "7HhF8Qr9kF4eEPak911Q": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1714514400,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Hydroxyzine",
//             "bareCode": "",
//             "medicationId": "7HhF8Qr9kF4eEPak911Q",
//             "image": "pill-4"
//         },
//         "7skKDwumbozEuRPbx7lB": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1696111200,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "L52",
//             "bareCode": "",
//             "medicationId": "7skKDwumbozEuRPbx7lB",
//             "image": "pill-5"
//         },
//         "9WU3i4TnaNebq8I6KSk4": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1696111200,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "DOMPER",
//             "bareCode": "",
//             "medicationId": "9WU3i4TnaNebq8I6KSk4",
//             "image": "pill-6"
//         },
//         "CQaYoSSAdwLBUiLWgv2X": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1706742000,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "DOXY",
//             "bareCode": "",
//             "medicationId": "CQaYoSSAdwLBUiLWgv2X",
//             "image": "pill-7"
//         },
//         "DQLkyfl4zNNTxJneQ1ym": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1717192800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 2,
//             "medicationId": "DQLkyfl4zNNTxJneQ1ym",
//             "name": "ANTISEPTIQUE",
//             "bareCode": "",
//             "image": "pill-8"
//         },
//         "EI9Ecfoe0lrktSenmDoR": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1688162400,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 2,
//             "medicationId": "EI9Ecfoe0lrktSenmDoR",
//             "name": "LEVOSTAMINE",
//             "bareCode": "",
//             "image": "pill-9"
//         },
//         "Fe1ggX2gZ4dvwSz8SY1l": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1735686000,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Racecadotril",
//             "bareCode": "",
//             "medicationId": "Fe1ggX2gZ4dvwSz8SY1l",
//             "image": "pill-10"
//         },
//         "G9zhAH7dQu8kh6YfviSb": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1701385200,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Dolirhume",
//             "bareCode": "",
//             "medicationId": "G9zhAH7dQu8kh6YfviSb",
//             "image": "pill-11"
//         },
//         "GdyOfZElTElZEAdgUj0w": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1711922400,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "PRANAROM",
//             "bareCode": "",
//             "medicationId": "GdyOfZElTElZEAdgUj0w",
//             "image": "pill-12"
//         },
//         "I723XWH3Ndc1nKX70WU7": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1759269600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "MOVICOL",
//             "bareCode": "",
//             "medicationId": "I723XWH3Ndc1nKX70WU7",
//             "image": "pill-13"
//         },
//         "IQilcdHYjCEbrs7yL4Vd": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1714514400,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "ASPIRINE",
//             "bareCode": "",
//             "medicationId": "IQilcdHYjCEbrs7yL4Vd",
//             "image": "pill-14"
//         },
//         "K4w39lCvLitfBGNHQEOp": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1688162400,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "XYLIX",
//             "bareCode": "",
//             "medicationId": "K4w39lCvLitfBGNHQEOp",
//             "image": "pill-15"
//         },
//         "Ko7R6KnFU0tHNuR8Wucg": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1688162400,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Spastop",
//             "bareCode": "",
//             "medicationId": "Ko7R6KnFU0tHNuR8Wucg",
//             "image": "pill-15"
//         },
//         "Nkkk56T7kwKr8q7AJwmi": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1788213600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "medicationId": "Nkkk56T7kwKr8q7AJwmi",
//             "name": "HEXASPRAY",
//             "bareCode": "",
//             "image": "pill-15"
//         },
//         "Ocpa7wfzWSUCileiOlVN": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1756677600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "CORTINASE",
//             "bareCode": "",
//             "medicationId": "Ocpa7wfzWSUCileiOlVN",
//             "image": "pill-15"
//         },
//         "Puzm42C4i1DztdaF6XRS": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1764543600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Doliprane",
//             "bareCode": "",
//             "medicationId": "Puzm42C4i1DztdaF6XRS",
//             "image": "pill-15"
//         },
//         "Qvk46tUW2MNWuVKDhxBu": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1753999200,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "After sun gel",
//             "bareCode": "",
//             "medicationId": "Qvk46tUW2MNWuVKDhxBu",
//             "image": "pill-15"
//         },
//         "SvZefJ6LVNDZxeSqxCzV": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1746050400,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 3,
//             "medicationId": "SvZefJ6LVNDZxeSqxCzV",
//             "name": "LANSOPRAL LANSOPRASOLE",
//             "bareCode": "",
//             "image": "pill-15"
//         },
//         "YgpcGtx9EAjQpnke17Yc": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1709247600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "RACECADOTRIL",
//             "bareCode": "",
//             "medicationId": "YgpcGtx9EAjQpnke17Yc",
//             "image": "pill-15"
//         },
//         "Z71zBXC8vbh9wb0rFtRc": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1759269600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Desloratadine",
//             "bareCode": "",
//             "medicationId": "Z71zBXC8vbh9wb0rFtRc",
//             "image": "pill-15"
//         },
//         "ZAQQu73Zx36Xfoats3VU": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1727733600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "VERAX BLUE",
//             "bareCode": "",
//             "medicationId": "ZAQQu73Zx36Xfoats3VU",
//             "image": "pill-15"
//         },
//         "ZDUZSv76hT0FUs6MEGFw": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1751320800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "RHINOMAXIL",
//             "bareCode": "",
//             "medicationId": "ZDUZSv76hT0FUs6MEGFw",
//             "image": "pill-15"
//         },
//         "ZTrwMWoEdjYcPIgjIPg6": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1811800800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "HEXASPRAY",
//             "bareCode": "",
//             "medicationId": "ZTrwMWoEdjYcPIgjIPg6",
//             "image": "pill-15"
//         },
//         "c69ZwKjbDeMgDJGbqVZ3": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1693519200,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "PURGATIF",
//             "bareCode": "",
//             "medicationId": "c69ZwKjbDeMgDJGbqVZ3",
//             "image": "pill-15"
//         },
//         "c9MupNl2gDY8ZxVMDNCS": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1727733600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "SYNTHOL",
//             "bareCode": "",
//             "medicationId": "c9MupNl2gDY8ZxVMDNCS",
//             "image": "pill-15"
//         },
//         "dyrmNsvhxz6duVhPoOTE": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1748728800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "RISOMAX",
//             "bareCode": "",
//             "medicationId": "dyrmNsvhxz6duVhPoOTE",
//             "image": "pill-15"
//         },
//         "e8rlgbKy180I9nNXNgno": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1704063600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 2,
//             "medicationId": "e8rlgbKy180I9nNXNgno",
//             "name": "TAVAFLOX",
//             "bareCode": "",
//             "image": "pill-15"
//         },
//         "ewKvv3AT1uwbKMHLpaon": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1730415600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 2,
//             "medicationId": "ewKvv3AT1uwbKMHLpaon",
//             "name": "DIPRED",
//             "bareCode": "",
//             "image": "pill-15"
//         },
//         "ffF8JCA6C8d74zUr9j1F": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1719784800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Ipproton",
//             "bareCode": "",
//             "medicationId": "ffF8JCA6C8d74zUr9j1F",
//             "image": "pill-15"
//         },
//         "gGtGpQMrX3QCmWzHEcAR": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1719784800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Esomeprazole",
//             "bareCode": "",
//             "medicationId": "gGtGpQMrX3QCmWzHEcAR",
//             "image": "pill-15"
//         },
//         "hlpnuI7SmYkPmSR4Xphw": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1761951600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 2,
//             "name": "GAVISCON",
//             "bareCode": "",
//             "medicationId": "hlpnuI7SmYkPmSR4Xphw",
//             "image": "pill-15"
//         },
//         "hqW7mBpBcWFHfxJGCJv8": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1719784800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Pansement",
//             "bareCode": "",
//             "medicationId": "hqW7mBpBcWFHfxJGCJv8",
//             "image": "pill-15"
//         },
//         "jkOxWSKZ4fT0tTEH2o29": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1706742000,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "CLARIMAX",
//             "bareCode": "",
//             "medicationId": "jkOxWSKZ4fT0tTEH2o29",
//             "image": "pill-15"
//         },
//         "jutS9mymjXXlUvSxvuhm": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1690840800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "ZITHOCARE",
//             "bareCode": "",
//             "medicationId": "jutS9mymjXXlUvSxvuhm",
//             "image": "pill-15"
//         },
//         "kerYLGXRGDaUnnCR2IdO": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1727733600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Desloratadine",
//             "bareCode": "",
//             "medicationId": "kerYLGXRGDaUnnCR2IdO",
//             "image": "pill-15"
//         },
//         "n6bsK7FFMTuGu5uG8eez": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1690840800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "PYOSTACINE",
//             "bareCode": "",
//             "medicationId": "n6bsK7FFMTuGu5uG8eez",
//             "image": "pill-15"
//         },
//         "nnUD7iGZGe0CpY1r9GKR": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1714514400,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "VITAMINE A A DULCIS",
//             "bareCode": "",
//             "medicationId": "nnUD7iGZGe0CpY1r9GKR",
//             "image": "pill-15"
//         },
//         "ooFUxMUWKt9Y9DVlBNN8": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1756677600,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "Upsa vitamine c",
//             "bareCode": "",
//             "medicationId": "ooFUxMUWKt9Y9DVlBNN8",
//             "image": "pill-15"
//         },
//         "qMbsTpSmSMHeoVZ2gyoC": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1696111200,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "DESLOR",
//             "bareCode": "",
//             "medicationId": "qMbsTpSmSMHeoVZ2gyoC",
//             "image": "pill-15"
//         },
//         "rnnbzgy4YxaHX9TOodJv": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1698793200,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "LEVOFAST",
//             "bareCode": "",
//             "medicationId": "rnnbzgy4YxaHX9TOodJv",
//             "image": "pill-15"
//         },
//         "u7J4sEiiBd64Eo8TjrKI": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1714514400,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "COPRED",
//             "bareCode": "",
//             "medicationId": "u7J4sEiiBd64Eo8TjrKI",
//             "image": "pill-15"
//         },
//         "xf9DykH3vco5Yu9fT6eb": {
//             "expiryDate": {
//
//                 "value": {
//                     "_seconds": 1717192800,
//                     "_nanoseconds": 0
//                 }
//             },
//             "uid": "DVdcTAQmltZwm2FCM4ggjPYPbvX2",
//             "expired": false,
//             "quantity": 1,
//             "name": "ENPHYTOSE NUIT",
//             "bareCode": "",
//             "medicationId": "xf9DykH3vco5Yu9fT6eb",
//             "image": "pill-15"
//         }
//     }
//     for (const [docId, docData] of Object.entries(backup)) {
//         // Prepare Firestore-compatible data
//         const firestoreData = {
//             ...docData,
//             expiryDate: new Date(
//                 docData.expiryDate.value._seconds * 1000
//             ),
//         }
//
//         try {
//             // Add each document to the collection
//             await database.doc(docId).set(firestoreData)
//             console.log(`Document with ID ${docId} successfully written!`)
//         } catch (error) {
//             console.error(`Error writing document with ID ${docId}: `, error)
//         }
//     }
// End of file
