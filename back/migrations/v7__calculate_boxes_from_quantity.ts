import { MigrateOptions } from 'fireway'
import { BigBatch } from '@qualdesk/firestore-big-batch'
import { Medication, MedicationDetails } from '../src/domain/entities/medication'

export async function migrate({ firestore }: MigrateOptions) {
    const collection = firestore.collection('medications');
    const snapshot = await collection.get();

    if (snapshot.empty) {
        console.log('No medications found. Migration v7 complete.');
        return;
    }

    console.log(`Found ${snapshot.size} medications to update box counts.`);

    const batch = new BigBatch({ firestore });
    let count = 0;
    const now = new Date()

    snapshot.docs.forEach((doc) => {
        const data = doc.data() as Medication
        const details = data.details as MedicationDetails
        const update: Partial<Medication> = {}

        if (details && details.quantity) {
            const units = details.quantity
            update.unitsPerBox = units

            // User Request: data.quantity previously represented boxes.
            // So if quantity is 2 (boxes), the total units should be 2 * unitsPerBox.
            const numberOfBoxes = data.quantity || 0

            update.numberOfBoxes = numberOfBoxes
            update.quantity = numberOfBoxes * units

            update.updatedAt = now
        }

        if (Object.keys(update).length > 0) {
            batch.update(doc.ref, update)
            count++
        }
    })

    if (count > 0) {
        console.log(`Prepared ${count} updates for box calculations. Committing...`)
        await batch.commit()
        console.log('Migration v7 complete.')
    } else {
        console.log('No medications needed box calculation updates. Migration v7 complete.')
    }
}
