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
        title: 'Medication Time 💊',
        body: (q, name) => `Take ${q}x ${name}`,
        lowStockTitle: 'Low Stock Warning ⚠️',
        lowStockBody: (q, name) => `You only have ${q} pills of ${name} left. Please restock soon!`,
        postpone1h: 'Postpone 1h ⏳',
        postponeLater: 'Postpone later 📅'
    },
    fr: {
        title: 'L\'heure de prendre vos médicaments 💊',
        body: (q, name) => `Prenez ${q}x ${name}`,
        lowStockTitle: 'Alerte Stock Bas ⚠️',
        lowStockBody: (q, name) => `Il ne vous reste que ${q} comprimés de ${name}. Pensez à vous réapprovisionner !`,
        postpone1h: 'Repousser d\'1h ⏳',
        postponeLater: 'Repousser plus tard 📅'
    }
};

// --- 4. Synchronous Firebase Initialization ---
// CRITICAL: Do NOT use fetch() here. The SW must init instantly to catch the push event.
const firebaseConfig = {
    'apiKey': 'AIzaSyD8L9ygNvkH0FO46dceDGmneRwQ7WuaFBk',
    'authDomain': 'my-pills-staging-460b5.firebaseapp.com',
    'projectId': 'my-pills-staging-460b5',
    'storageBucket': 'my-pills-staging-460b5.firebasestorage.app',
    'messagingSenderId': '824429090964',
    'appId': '1:824429090964:web:7e0cb8ae45c2424b8afc81',
    'measurementId': 'G-SBR5TS02DD'
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
    const type = payload.data?.type || 'reminder';
    const medName = payload.data?.medName || 'Medication';
    const quantity = payload.data?.quantity || '1';

    const browserLang = (navigator.language || 'en').split('-')[0];
    const lang = dictionary[browserLang] ? browserLang : 'en';

    let title, body;
    if (type === 'low_stock') {
        title = dictionary[lang].lowStockTitle;
        body = dictionary[lang].lowStockBody(quantity, medName);
    } else {
        title = dictionary[lang].title;
        body = dictionary[lang].body(quantity, medName);
    }

    return self.registration.showNotification(title, {
        body: body,
        icon: '/icon_x192.png',
        data: payload.data,
        vibrate: [200, 100, 200],
        requireInteraction: true,
        silent: false
    });
});

self.addEventListener('notificationclick', (event) => {
    // 1. Close the notification immediately
    event.notification.close();

    const reminderId = event.notification?.data?.reminderId || null;
    const action = event.action;

    console.log('Notification clicked. Action:', action);

    // 2. Determine the target URL
    let targetUrl = '/reminders';

    // Ensure we handle the base URL correctly for the PWA scope
    const urlBase = self.registration.scope.replace(/\/$/, '');

    // Always use confirm action when clicking the notification
    targetUrl = `${urlBase}/reminders?action=confirm&reminderId=${reminderId}&t=${Date.now()}`;

    // 3. The "Focus or Open" Pattern
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        // A. If there is already a window open, focus it and navigate
        for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            // Check if the client is valid and focusable
            if (client.url.startsWith(urlBase) && 'focus' in client) {
                return client.focus().then((focusedClient) => {
                    // CRITICAL: Explicitly navigate the focused client to the new URL
                    if ('navigate' in focusedClient) {
                        return focusedClient.navigate(targetUrl);
                    }
                });
            }
        }

        // B. If no window is open, open a new one
        if (clients.openWindow) {
            return clients.openWindow(targetUrl);
        }
    });
    event.waitUntil(promiseChain);
});