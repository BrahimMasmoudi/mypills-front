import { MigrateOptions } from 'fireway'
import { BigBatch } from '@qualdesk/firestore-big-batch'
import { Medication, MedicationDetails } from '../src/domain/entities/medication'

export async function migrate({ firestore }: MigrateOptions) {
    const collection = firestore.collection('medications');
    const snapshot = await collection.get();

    if (snapshot.empty) {
        console.log('No medications found. Migration v6 complete.');
        return;
    }

    console.log(`Found ${snapshot.size} medications to check for quantity extraction.`);

    const batch = new BigBatch({ firestore });
    let count = 0;
    const now = new Date()

    snapshot.docs.forEach((doc) => {
        const data = doc.data() as Medication
        const details = data.details as MedicationDetails

        // Check if details exists but quantity is missing
        if (details && !details.quantity) {
            const presentation = details.presentations?.[0]
            if (presentation && presentation.label) {
                const quantity = parseMedicationUnit(presentation.label)
                const update: any = {
                    'details.quantity': quantity,
                    updatedAt: now
                }

                batch.update(doc.ref, update)
                count++
            }
        }
    })

    if (count > 0) {
        console.log(`Prepared ${count} updates for quantity extraction. Committing...`)
        await batch.commit()
        console.log('Migration v6 complete.')
    } else {
        console.log('No medications needed quantity extraction. Migration v6 complete.')
    }
}

const parseMedicationUnit = (label?: string): number => {
    if (!label) return 1
    const match = label.match(/(\d+)\s*(?:comprimé|gélule|sachet|dose|pastille|pilule|tablette|tablet|capsule|pill|ampoule|unidose)s?/i)

    if (match && match[1]) {
        return parseInt(match[1])
    }
    return 1
}
