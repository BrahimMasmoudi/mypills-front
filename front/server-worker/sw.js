// --- 1. Workbox Logic ---
import {clientsClaim} from 'workbox-core'
import {precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL} from 'workbox-precaching'
import {registerRoute, NavigationRoute} from 'workbox-routing'

self.skipWaiting()
clientsClaim()

// Precache assets
precacheAndRoute(self.__WB_MANIFEST)

// Clean up old cache
cleanupOutdatedCaches()

// (Optional) Handle SPA navigation
try {
    const handler = createHandlerBoundToURL('/')
    const route = new NavigationRoute(handler)
    registerRoute(route)
} catch (error) {
    console.warn('Error while registering cache route', {error})
}

// --- 2. Firebase Logic (Refactored to ES Imports) ---
import {initializeApp} from 'firebase/app';
// Note: We import from 'firebase/messaging/sw' specifically for Service Workers
import {getMessaging, onBackgroundMessage} from 'firebase/messaging/sw';

// Retrieve the config injected via vite.define
fetch('/__/firebase/init.json').then(res => res.json())
    .then((firebaseConfig) => {
        console.log('firebaseConfig', firebaseConfig)
// Initialize Firebase (Modular style)
        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        // Use the imported 'onBackgroundMessage' function
        onBackgroundMessage(messaging, (payload) => {
            console.log('[SW] Background message received', payload);

            const medName = payload.data?.medName || 'Medication';
            const quantity = payload.data?.quantity || '1';

            // Helper to get language
            const browserLang = (navigator.language || 'en').split('-')[0];
            const lang = dictionary[browserLang] ? browserLang : 'en';

            const title = dictionary[lang].title;
            const body = dictionary[lang].body(quantity, medName);

            self.registration.showNotification(title, {
                body: body,
                icon: '/icon_x192.png', // Ensure this file exists in public/
                data: payload.data,
                tag: 'medication-notification'
            });
        });
    })


// --- 3. Your Custom Notification Logic ---
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