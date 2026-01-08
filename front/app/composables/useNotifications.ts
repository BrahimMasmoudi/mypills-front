import {getToken, onMessage} from "firebase/messaging";
import {httpsCallable} from "firebase/functions";
import {useQueueToast} from "~/composables/useQueueToast";

export const useNotifications = () => {
    const {$functions, $config, $messaging, $i18n} = useNuxtApp()
    const {addToast} = useQueueToast()
    const app = useFirebaseApp()
    const registerNotificationToken = async () => {
        try {

            const permission = await Notification.requestPermission()
            if (permission !== 'granted') return

            const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?config=${encodeURIComponent(JSON.stringify(app.options))}`)

            const currentToken = await getToken($messaging, {
                vapidKey: $config.public.firebase.cloudMessaging.vapidKey,
                serviceWorkerRegistration: registration,
            })
            console.log('currentToken', currentToken)
            if (currentToken) {
                const saveToken = httpsCallable($functions, 'saveUserToken')
                await saveToken({fcmToken: currentToken})
            }

        } catch (error) {
            console.error('Error saving notification token:', error)
        }
    }

    const listenForMessages = () => {
        onMessage($messaging, (payload) => {
            const {medName, quantity} = payload.data || {}

            const title = $i18n.t('notification.title')
            const body = $i18n.t('notification.body', {quantity, medName})

            addToast('success', `${title} ${body}`)
        })
    }

    return {registerNotificationToken, listenForMessages}
}