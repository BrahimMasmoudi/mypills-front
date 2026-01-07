import {getMessaging, getToken, onMessage} from "firebase/messaging";
import {httpsCallable} from "firebase/functions";

export const useNotifications = () => {
    const {$functions, $config, $messaging} = useNuxtApp()
    const registerNotificationToken = async () => {
        try {

            const permission = await Notification.requestPermission()
            if (permission !== 'granted') return
            const currentToken = await getToken($messaging, {
                vapidKey: $config.public.firebase.cloudMessaging.vapidKey,
            })
            console.log('currentToken', currentToken)
            if (currentToken) {
                const saveToken = httpsCallable($functions, 'saveUserToken')
                await saveToken({fcmToken: currentToken})


            }
            onMessage($messaging, (payload) => {
                console.log('Message received. ', payload)
            })
        } catch (error) {
            console.error('Error saving notification token:', error)
        }
    };

    return {registerNotificationToken}
}