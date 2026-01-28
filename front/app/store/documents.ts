import { defineStore } from 'pinia'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useCollection, useFirestore, useFirebaseStorage, useCurrentUser } from 'vuefire'
import { collection, addDoc, serverTimestamp, query, where } from 'firebase/firestore'
import { computed, ref } from 'vue'

export const useDocumentsStore = defineStore('documents', () => {
    const db = useFirestore()
    const storage = useFirebaseStorage()
    const user = useCurrentUser()

    const activeFolder = ref('Me')

    const allDocuments = useCollection(() =>
        user.value ? collection(db, `users/${user.value.uid}/documents`) : null
    )

    const folderDocuments = useCollection(() => {
        if (!user.value) return null
        return query(
            collection(db, `users/${user.value.uid}/documents`),
            where('folderName', '==', activeFolder.value)
        )
    })

    const existingFolders = computed(() => {
        const folderSet = new Set<string>(['Me'])
        if (allDocuments.value) {
            allDocuments.value.forEach(doc => {
                if (doc.folderName) folderSet.add(doc.folderName)
            })
        }
        return Array.from(folderSet).sort()
    })

    const uploadDocument = async (folder: string, name: string, pdfBlob: Blob) => {
        if (!user.value) throw new Error('Unauthorized')

        const path = `users/${user.value.uid}/${folder}/${name}_${Date.now()}.pdf`
        const fileRef = storageRef(storage, path)

        const snapshot = await uploadBytes(fileRef, pdfBlob)
        const downloadUrl = await getDownloadURL(snapshot.ref)

        await addDoc(collection(db, `users/${user.value.uid}/documents`), {
            name,
            folderName: folder, // This is our "Virtual Folder" key
            fileUrl: downloadUrl,
            storagePath: path,
            uploadedAt: serverTimestamp(),
            size: pdfBlob.size,
            type: 'application/pdf'
        })
    }

    return {
        uploadDocument,
        allDocuments,
        folderDocuments,
        existingFolders,
        activeFolder,
        isLoading: computed(() => allDocuments.pending)
    }
})