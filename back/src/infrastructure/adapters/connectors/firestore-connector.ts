import { Firestore, CollectionReference } from 'firebase-admin/firestore'

export class FirestoreConnector {
    // We pass the Firestore instance here
    constructor(public readonly firestore: Firestore) {}

    public collection(name: string): CollectionReference {
        return this.firestore.collection(name)
    }
}
