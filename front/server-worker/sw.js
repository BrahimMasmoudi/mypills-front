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
    const route = new NavigationRoute(handler)
    registerRoute(route)
} catch (error) {
    console.warn('Error while registering cache route', { error })
}

const dictionary = {
    en: {
        title: "Medication Time 💊",
        body: (q, name) => `Take ${q}x ${name}`
    },
    fr: {
        title: "L'heure de prendre vos médicaments 💊",
        body: (q, name) => `Prenez ${q}x ${name}`
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
    const medName = payload.data?.medName || 'Medication';
    const quantity = payload.data?.quantity || '1';

    const browserLang = (navigator.language || 'en').split('-')[0];
    const lang = dictionary[browserLang] ? browserLang : 'en';

    const title = dictionary[lang].title;
    const body = dictionary[lang].body(quantity, medName);

    return self.registration.showNotification(title, {
        body: body,
        icon: '/icon_x192.png',
        data: payload.data,
        tag: 'medication-notification',
        renotify: true,
        vibrate: [200, 100, 200]
    });
});

self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification click received.');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
            // Check if there is already a window open and focus it
            for (let client of windowClients) {
                if (client.url && 'focus' in client) return client.focus();
            }
            // If no window is open, open a new one
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});