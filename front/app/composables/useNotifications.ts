import { getToken, onMessage } from 'firebase/messaging'
import { httpsCallable } from 'firebase/functions'
import { useQueueToast } from '~/composables/useQueueToast'
import { useReminderStore } from '~/store/reminder'

export const useNotifications = () => {
    const { $functions, $config, $messaging, $i18n } = useNuxtApp()
    const { addToast } = useQueueToast()
    const registerNotificationToken = async () => {
        try {
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') return

            const registration = await navigator.serviceWorker.ready
            const currentToken = await getToken($messaging, {
                vapidKey: $config.public.firebase.cloudMessaging.vapidKey,
                serviceWorkerRegistration: registration,
            })
            if (currentToken) {
                const saveToken = httpsCallable($functions, 'saveUserToken')
                await saveToken({ fcmToken: currentToken })
            }
        } catch (error) {
            console.error('Error saving notification token:', error)
        }
    }

    const listenForMessages = () => {
        onMessage($messaging, (payload) => {
            const { medName, quantity, reminderId } = payload.data || {}

            const title = $i18n.t('notification.title')
            const body = $i18n.t('notification.body', { quantity, medName })

            addToast('success', `${title} ${body}`, [
                {
                    label: 'Postpone 1h',
                    onClick: () => {
                        if (reminderId) {
                            const reminderStore = useReminderStore()
                            reminderStore.postponeReminderBy1h(reminderId)
                        }
                    }
                },
                {
                    label: 'Later',
                    onClick: () => {
                        if (reminderId) {
                            const router = useRouter()
                            router.push(`/reminders?action=postpone-later&reminderId=${reminderId}`)
                        }
                    }
                }
            ])
        })
    }

    return { registerNotificationToken, listenForMessages }
}
