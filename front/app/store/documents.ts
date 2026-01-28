import {defineStore} from 'pinia'
import {ref as storageRef, uploadBytes, getDownloadURL, deleteObject, getBytes} from 'firebase/storage'
import {useCollection, useCurrentUser} from 'vuefire'
import {collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, writeBatch} from 'firebase/firestore'
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

    const moveStorageFile = async (oldPath: string, newPath: string) => {
        const oldRef = storageRef($storage, oldPath)
        const newRef = storageRef($storage, newPath)

        const data = await getBytes(oldRef)

        await uploadBytes(newRef, data)

        await deleteObject(oldRef)

        return await getDownloadURL(newRef)
    }

    const renameDocument = async (docItem: any, newName: string) => {
        if (!user.value) return

        const fileExtension = docItem.storagePath.split('.').pop()
        const newPath = `users/${user.value.uid}/${docItem.folderName}/${newName}_${Date.now()}.${fileExtension}`

        const newUrl = await moveStorageFile(docItem.storagePath, newPath)

        const docRef = doc($firestore, `users/${user.value.uid}/documents`, docItem.id)
        await updateDoc(docRef, {
            name: newName,
            storagePath: newPath,
            fileUrl: newUrl
        })
    }

    const renameFolder = async (oldFolderName: string, newFolderName: string) => {
        if (!user.value || !allDocuments.value) return
        const targets = allDocuments.value.filter(d => d.folderName === oldFolderName)
        const folderMovePromises = targets.map(async (docItem) => {
            const fileExtension = docItem.storagePath.split('.').pop()
            const newPath = `users/${user.value!.uid}/${newFolderName}/${docItem.name}_${Date.now()}.${fileExtension}`

            const newUrl = await moveStorageFile(docItem.storagePath, newPath)

            return {
                id: docItem.id,
                storagePath: newPath,
                fileUrl: newUrl,
                folderName: newFolderName
            }
        })

        const results = await Promise.all(folderMovePromises)

        const batch = writeBatch($firestore)
        results.forEach(res => {
            const docRef = doc($firestore, `users/${user.value!.uid}/documents`, res.id)
            batch.update(docRef, {
                folderName: res.folderName,
                storagePath: res.storagePath,
                fileUrl: res.fileUrl
            })
        })

        await batch.commit()
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
        const targets = allDocuments.value.filter(d => d.folderName === folderName)
        const deletionPromises = targets.map(async (documentItem) => {
            const fileRef = storageRef($storage, documentItem.storagePath)
            try {
                await deleteObject(fileRef)
            } catch (e) {
                console.warn(`Storage missing: ${documentItem.name}`)
            }
            const docRef = doc($firestore, `users/${user.value!.uid}/documents`, documentItem.id)
            return deleteDoc(docRef)
        })
        await Promise.all(deletionPromises)
    }

    return {
        uploadDocument,
        renameDocument,
        renameFolder,
        deleteDocument,
        deleteFolder,
        allDocuments,
        existingFolders,
        activeFolder,
        isLoading
    }
})