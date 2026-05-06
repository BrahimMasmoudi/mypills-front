import { MigrateOptions } from 'fireway';
import { BigBatch } from '@qualdesk/firestore-big-batch';

export const description = 'Add default normal role to all users';

export async function migrate({ firestore }: MigrateOptions) {

    const usersCollection = firestore.collection('users')
    const snapshot = await usersCollection.get()

    if (snapshot.empty) return

    const batch = new BigBatch({ firestore })
    let count = 0

    snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.role) {
            batch.update(doc.ref, { role: 'normal' })
            count++
        }
    });

    if (count > 0) {
        await batch.commit()
    }
}
