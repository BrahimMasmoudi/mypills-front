import { MigrateOptions } from 'fireway';
import { BigBatch } from '@qualdesk/firestore-big-batch';

// @ts-ignore
import medsData from '../src/tn_meds.json'

export async function migrate({ firestore }: MigrateOptions) {
    console.log('Migration started: Importing Tunisian Meds...');

    // 1. Load the data
    // The import might come in as a Module, so we handle both direct array or default export
    const medsArray = (medsData as any).default || medsData;

    if (!Array.isArray(medsArray)) {
        throw new Error("Data is not an array. Please check the JSON structure.");
    }

    const total = medsArray.length;
    console.log(`Found ${total} medications to migrate.`);

    // 2. Initialize BigBatch
    const collection = firestore.collection('tunisian_meds');
    const batch = new BigBatch({ firestore });

    let count = 0;

    // 3. Iterate and Queue Operations
    for (const med of medsArray) {
        // Create a reference with a random auto-generated ID
        const ref = collection.doc();

        // Add the set operation to the batch
        batch.set(ref, med);

        count++;

        // Optional: Log progress every 1000 items
        if (count % 1000 === 0) {
            console.log(`Processed ${count}/${total} records...`);
        }
    }

    // 4. Commit
    console.log(`Prepared ${count} operations. Committing to Firestore...`);
    await batch.commit();
    console.log('Migration complete.');
}