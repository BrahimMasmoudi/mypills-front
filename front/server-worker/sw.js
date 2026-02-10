// --- 1. Workbox Logic ---
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

try {
    const handler = createHandlerBoundToURL('/')

    registerRoute(
        new NavigationRoute(handler, {
            denylist: [/^\/reminders/],
        })
    )
} catch (error) {
    console.warn('Error while registering cache route', { error })
}

const dictionary = {
    en: {
        title: "Medication Time 💊",
        body: (q, name) => `Take ${q}x ${name}`,
        postpone1h: "Postpone 1h ⏳",
        postponeLater: "Postpone later 📅"
    },
    fr: {
        title: "L'heure de prendre vos médicaments 💊",
        body: (q, name) => `Prenez ${q}x ${name}`,
        postpone1h: "Repousser d'1h ⏳",
        postponeLater: "Repousser plus tard 📅"
    }
};

// --- 4. Synchronous Firebase Initialization ---
// CRITICAL: Do NOT use fetch() here. The SW must init instantly to catch the push event.
const firebaseConfig = {
    "apiKey": "AIzaSyD8L9ygNvkH0FO46dceDGmneRwQ7WuaFBk",
    "authDomain": "my-pills-staging-460b5.firebaseapp.com",
    "projectId": "my-pills-staging-460b5",
    "storageBucket": "my-pills-staging-460b5.firebasestorage.app",
    "messagingSenderId": "824429090964",
    "appId": "1:824429090964:web:7e0cb8ae45c2424b8afc81",
    "measurementId": "G-SBR5TS02DD"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
    const data = payload.data || {}

    const medName = data.medName || 'Medication'
    const quantity = data.quantity || '1'
    const reminderId = data.reminderId

    const browserLang = (self.navigator.language || 'en').split('-')[0]
    const lang = dictionary[browserLang] ? browserLang : 'en'

    const title = dictionary[lang].title
    const body = dictionary[lang].body(quantity, medName)

    return self.registration.showNotification(title, {
        body,
        icon: '/icon_x192.png',
        tag: 'medication-notification',
        renotify: true,
        vibrate: [200, 100, 200],
        requireInteraction: true,
        silent: false,

        // 🔥 CRITICAL PART: action === URL
        actions: [
            {
                action: `/reminders?action=postpone-1h&reminderId=${reminderId}`,
                title: dictionary[lang].postpone1h,
                icon: '/icons/clock.png',
            },
            {
                action: `/reminders?action=postpone-later&reminderId=${reminderId}`,
                title: dictionary[lang].postponeLater,
                icon: '/icons/calendar.png',
            },
        ],

        data,
    })
})

// ------------------------------
// 7. Notification click handling
// ------------------------------
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    // Android bug-proof:
    // event.action IS the URL
    const url = event.action || '/reminders'

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                for (const client of windowClients) {
                    if ('navigate' in client && 'focus' in client) {
                        return client.navigate(url).then(() => client.focus())
                    }
                }
                return clients.openWindow(url)
            })
    )
})

