
import { MigrateOptions } from 'fireway';

export async function migrate({ firestore }: MigrateOptions) {
    const remindersRef = firestore.collection('reminders')
    const snapshot = await remindersRef.where('status', '==', 'sent').get()

    if (snapshot.empty) {
        console.log('No reminders with status "sent" found.')
        return
    }

    const batch = firestore.batch()
    snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { status: 'done' })
    })

    await batch.commit()
    console.log(`Updated ${snapshot.size} reminders from "sent" to "done".`)
}
