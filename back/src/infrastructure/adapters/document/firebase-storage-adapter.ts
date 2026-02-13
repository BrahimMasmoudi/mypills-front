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

    async generateSignedUrl(storagePath: string, expiresInMs: number): Promise<string> {
        const bucket = this.storage.bucket()
        const file = bucket.file(storagePath)

        // Check if running in emulator (no service account credentials available)
        const isEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_STORAGE_EMULATOR_HOST

        if (isEmulator) {
            // In emulator, we need to generate a URL with an access token
            // This mimics how signed URLs work in production (bypass storage rules)

            // First, get or create a download token for the file
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

        // Production: use signed URLs
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + expiresInMs,
        })
        return url
    }
}
