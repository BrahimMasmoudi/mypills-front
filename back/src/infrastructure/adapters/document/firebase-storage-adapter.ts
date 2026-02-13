import { Storage } from 'firebase-admin/storage'
import { DocumentStoragePort } from '../../../domain/gateway/document/document-storage-port'
import { $storage } from '../../config/firebase'

export class FirebaseStorageAdapter implements DocumentStoragePort {
    private storage: Storage

    constructor() {
        this.storage = $storage
    }

    async exists(storagePath: string): Promise<boolean> {
        const bucket = this.storage.bucket()
        const file = bucket.file(storagePath)
        const [exists] = await file.exists()
        return exists
    }

    async generateTemporaryUrl(storagePath: string): Promise<string> {
        const bucket = this.storage.bucket()
        const file = bucket.file(storagePath)

        const isEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_STORAGE_EMULATOR_HOST

        if (isEmulator) {
            const [metadata] = await file.getMetadata()
            let token: string

            if (metadata.metadata?.firebaseStorageDownloadTokens) {
                token = String(metadata.metadata.firebaseStorageDownloadTokens)
            } else {
                // Generate a new token if one doesn't exist
                token = require('crypto').randomUUID()
                await file.setMetadata({
                    metadata: {
                        firebaseStorageDownloadTokens: String(token)
                    }
                })
            }

            const bucketName = bucket.name
            const encodedPath = encodeURIComponent(storagePath)

            // Return URL with token - this bypasses storage rules like signed URLs do
            return `http://127.0.0.1:9199/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
        }

        const [metadata] = await file.getMetadata()
        let token: string

        if (metadata.metadata?.firebaseStorageDownloadTokens) {
            token = String(metadata.metadata.firebaseStorageDownloadTokens)
        } else {
            // Generate a new token if one doesn't exist
            token = require('crypto').randomUUID()
            await file.setMetadata({
                metadata: {
                    firebaseStorageDownloadTokens: String(token)
                }
            })
        }

        const bucketName = bucket.name
        const encodedPath = encodeURIComponent(storagePath)

        return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
    }
}
