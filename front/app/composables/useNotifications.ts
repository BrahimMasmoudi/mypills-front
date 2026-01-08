import {getToken, onMessage} from "firebase/messaging";
import {httpsCallable} from "firebase/functions";
import {useSnackbarStore} from "~/store/snackbarStore";

export const useNotifications = () => {
    const {$functions, $config, $messaging} = useNuxtApp()
    const snackbarStore = useSnackbarStore()
     const registerNotificationToken = async () => {
        try {

            const permission = await Notification.requestPermission()
            if (permission !== 'granted') return

            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
            console.log(registration)
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
        console.log("🎧 Listening for foreground messages...")
        onMessage($messaging, (payload) => {
            console.log('🚨 FOREGROUND MESSAGE RECEIVED:', payload)
            snackbarStore.notify(payload)
        })
    }

    return {registerNotificationToken, listenForMessages}
}