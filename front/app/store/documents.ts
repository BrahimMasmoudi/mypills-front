import {defineStore} from 'pinia'
import {ref as storageRef, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage'
import {useCollection, useCurrentUser} from 'vuefire'
import {collection, addDoc, serverTimestamp, doc, deleteDoc} from 'firebase/firestore'
import {computed, ref} from 'vue'

export const useDocumentsStore = defineStore('documents', () => {
    const {$firestore, $storage} = useNuxtApp()
    const user = useCurrentUser()

    const activeFolder = ref()

    const allDocuments = useCollection(() =>
        user.value ? collection($firestore, `users/${user.value.uid}/documents`) : null
    )

    const isLoading = computed(() => allDocuments.pending.value)

    const existingFolders = computed(() => {
        const folderSet = new Set<string>([])
        if (allDocuments.value) {
            allDocuments.value.forEach(d => {
                if (d.folderName) folderSet.add(d.folderName)
            })
        }
        return Array.from(folderSet).sort()
    })

    const uploadDocument = async (folder: string, name: string, pdfBlob: Blob) => {
        if (!user.value) throw new Error('Unauthorized')

        const path = `users/${user.value.uid}/${folder}/${name}_${Date.now()}.pdf`
        const fileRef = storageRef($storage, path)

        const snapshot = await uploadBytes(fileRef, pdfBlob)
        const downloadUrl = await getDownloadURL(snapshot.ref)

        await addDoc(collection($firestore, `users/${user.value.uid}/documents`), {
            name,
            folderName: folder,
            fileUrl: downloadUrl,
            storagePath: path,
            uploadedAt: serverTimestamp(),
            size: pdfBlob.size,
            type: 'application/pdf',
            uid: user.value.uid
        })
    }

    const deleteDocument = async (documentItem: any) => {
        if (!user.value) return

        const fileRef = storageRef($storage, documentItem.storagePath)
        try {
            await deleteObject(fileRef)
        } catch (e) {
            console.warn("Storage delete failed, proceeding with Firestore cleanup", e)
        }

        const docRef = doc($firestore, `users/${user.value.uid}/documents`, documentItem.id)
        await deleteDoc(docRef)
    }

    const deleteFolder = async (folderName: string) => {
        if (!user.value || !allDocuments.value) return

        // 1. Identify all documents belonging to this folder
        const targets = allDocuments.value.filter(d => d.folderName === folderName)

        // 2. Map out the deletion promises
        const deletionPromises = targets.map(async (documentItem) => {
            // A. Delete from Storage
            const fileRef = storageRef($storage, documentItem.storagePath)
            try {
                await deleteObject(fileRef)
            } catch (e) {
                // If file is already gone, we don't want to stop the DB cleanup
                console.warn(`Storage file missing for ${documentItem.name}, cleaning up Firestore record anyway.`)
            }

            // B. Delete from Firestore
            const docRef = doc($firestore, `users/${user.value!.uid}/documents`, documentItem.id)
            return deleteDoc(docRef)
        })

        // 3. Execute all deletions in parallel
        await Promise.all(deletionPromises)

        // 4. Reset activeFolder if it was the one deleted
        if (activeFolder.value === folderName) {
            activeFolder.value = existingFolders.value[0] || 'Me'
        }
    }

    return {
        uploadDocument,
        deleteDocument,
        deleteFolder,
        allDocuments,
        existingFolders,
        activeFolder,
        isLoading
    }
})