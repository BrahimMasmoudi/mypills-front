importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

// 1. Extract Config from Query Params
// This runs synchronously, so it's safe and fast
const getFirebaseConfig = () => {
    try {
        const urlParams = new URLSearchParams(self.location.search);
        const configString = urlParams.get('config');
        if (configString) {
            return JSON.parse(decodeURIComponent(configString));
        }
    } catch (e) {
        console.error('Failed to parse Firebase config from URL', e);
    }
};

const firebaseConfig = getFirebaseConfig();

// 2. Initialize with Dynamic Config
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

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

messaging.onBackgroundMessage((payload) => {
    const medName = payload.data?.medName || 'Medication';
    const quantity = payload.data?.quantity || '1';

    const browserLang = (navigator.language || 'en').split('-')[0];
    const lang = dictionary[browserLang] ? browserLang : 'en';

    const title = dictionary[lang].title;
    const body = dictionary[lang].body(quantity, medName);

    self.registration.showNotification(title, {
        body: body,
        icon: '/icon_x192.png', // Ensure this exists
        data: payload.data
    });
});

self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification click received.');
    event.notification.close();
});