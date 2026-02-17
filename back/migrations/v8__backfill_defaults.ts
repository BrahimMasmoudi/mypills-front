import { MigrateOptions } from 'fireway'
import { BigBatch } from '@qualdesk/firestore-big-batch'
import { Medication } from '../src/domain/entities/medication'

export async function migrate({ firestore }: MigrateOptions) {
    const collection = firestore.collection('medications');
    const snapshot = await collection.get();

    if (snapshot.empty) {
        console.log('No medications found. Migration v8 complete.');
        return;
    }

    console.log(`Found ${snapshot.size} medications to check for defaults.`);

    const batch = new BigBatch({ firestore });
    let count = 0;
    const now = new Date()

    snapshot.docs.forEach((doc) => {
        const data = doc.data() as Medication
        const update: Partial<Medication> = {}

        if (data.numberOfBoxes === undefined || data.numberOfBoxes === null) {
            update.numberOfBoxes = 1
        }

        if (data.unitsPerBox === undefined || data.unitsPerBox === null) {
            update.unitsPerBox = 1
        }

        if (Object.keys(update).length > 0) {
            update.updatedAt = now
            batch.update(doc.ref, update)
            count++
        }
    })

    if (count > 0) {
        console.log(`Prepared ${count} updates for defaults backfill. Committing...`)
        await batch.commit()
        console.log('Migration v8 complete.')
    } else {
        console.log('No medications needed defaults backfill. Migration v8 complete.')
    }
}
