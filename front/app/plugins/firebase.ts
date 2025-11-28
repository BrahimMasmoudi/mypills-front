import { useFirebaseApp, useFirestore } from 'vuefire'
import { getFunctions, connectFunctionsEmulator } from '@firebase/functions'
import { getAnalytics, setUserId, setUserProperties } from '@firebase/analytics'

export default defineNuxtPlugin(async ({ provide, $config }) => {
    const app = useFirebaseApp() // USE VueFire's already initialized app

    // Firestore
    const firestore = useFirestore()
    provide('firestore', firestore)

    // Functions
    const functions = getFunctions(app, $config.public.firebase.functions.location || 'europe-west3')
    if ($config.public.firebase.functions.enableEmulator) {
        connectFunctionsEmulator(
            functions,
            $config.public.firebase.functions.emulatorHost || '127.0.0.1',
            $config.public.firebase.functions.emulatorPort || 5001
        )
    }
    provide('functions', functions)

    // Analytics
    if ($config.public.firebase.analytics.enable) {
        const analytics = getAnalytics(app)
        const { getCurrentUser } = await import('vuefire')
        const user = await getCurrentUser()
        if (user?.uid) {
            setUserId(analytics, user.uid)
            setUserProperties(analytics, {
                email: user.email,
                displayName: user.displayName
            })
        }
        provide('analytics', analytics)
    }
})
