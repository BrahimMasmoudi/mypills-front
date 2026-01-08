importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyD8L9ygNvkH0FO46dceDGmneRwQ7WuaFBk",
    authDomain: "my-pills-staging-460b5.firebaseapp.com",
    projectId: "my-pills-staging-460b5",
    storageBucket: "my-pills-staging-460b5.firebasestorage.app",
    messagingSenderId: "824429090964",
    appId: "1:824429090964:web:7e0cb8ae45c2424b8afc81",
});

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