import {MigrateOptions} from 'fireway'
import {BigBatch} from '@qualdesk/firestore-big-batch'

export async function migrate({firestore}: MigrateOptions) {
    const remindersCollection = firestore.collection('reminders')
    const batch = new BigBatch({firestore})

    const snapshot = await remindersCollection.get()
    let updatedCount = 0

    snapshot.docs.forEach((doc, index) => {
        batch.set(doc.ref, {
            sicknessName: `sickness name ${index}`,
            updatedAt: new Date(),
        }, {merge: true})
        updatedCount++
    })

    if (updatedCount === 0) {
        return
    }

    try {
        await batch.commit()
    } catch (error) {
        throw error
    }
}