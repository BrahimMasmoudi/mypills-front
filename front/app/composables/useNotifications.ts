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


    // const sendNotificationManually = async () => {
    //     const user = await getCurrentUser()
    //     const LOCAL_URL = "http://localhost:5001/my-pills-staging-460b5/europe-west3/sendFCMNotification";
    //
    //     const response = await fetch(LOCAL_URL, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             userId: user?.uid, // Make sure this exists in your Firestore 'users' collection
    //             medName: 'doliprane',
    //             quantity: 1
    //         })
    //     });
    //
    //     const result = await response.text();
    //     console.log("Result:", result);
    //     return result
    // }

    return {registerNotificationToken, listenForMessages}
}