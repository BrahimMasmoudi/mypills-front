import { MigrateOptions } from 'fireway';
import { BigBatch } from '@qualdesk/firestore-big-batch';

export async function migrate({ firestore }: MigrateOptions) {
    const collection = firestore.collection('medications')
    const snapshot = await collection.get();

    if (snapshot.empty) {
        console.log('No medications found. Migration complete.');
        return;
    }

    console.log(`Found ${snapshot.size} medications to update.`);

    const batch = new BigBatch({ firestore });
    let count = 0;
    const now = new Date();

    snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const update: any = {};

        if (!data.createdAt) {
            update.createdAt = now;
        }
        if (!data.updatedAt) {
            update.updatedAt = now;
        }

        if (Object.keys(update).length > 0) {
            batch.update(doc.ref, update);
            count++;
        }
    });

    if (count > 0) {
        console.log(`Prepared ${count} updates. Committing...`);
        await batch.commit();
        console.log('Migration v4 complete.');
    } else {
        console.log('No medications needed updates. Migration v4 complete.');
    }
}
