import { MigrateOptions } from 'fireway';
import { BigBatch } from '@qualdesk/firestore-big-batch';
import * as mappingData from '../src/cip13_cis_mapping.json';

export const description = 'Migrate CIP13 to CIS mapping';

export async function migrate({ firestore }: MigrateOptions) {
    console.log('Migration v1 started: CIP13 -> CIS');

    // Type assertion
    const mapping = mappingData as unknown as Record<string, string>;
    const entries = Object.entries(mapping);
    const total = entries.length;

    console.log(`Found ${total} entries to migrate.`);

    const collection = firestore.collection('cip_to_cis');
    const batch = new BigBatch({ firestore });

    let count = 0;
    for (const [cip13, cis] of entries) {
        // Use CIP13 as ID
        const ref = collection.doc(cip13);
        batch.set(ref, { cis });
        count++;
    }

    console.log(`Prepared ${count} operations. Committing...`);
    await batch.commit();
    console.log('Migration v1 complete.');
}
