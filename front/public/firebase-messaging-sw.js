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

// 3. Setup Messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message:', payload);

    // Fallback logic for title/body if data payload is used
    const title = payload.notification?.title || payload.data?.title || 'New Reminder';
    const body = payload.notification?.body || payload.data?.body || 'Check your medication';

    self.registration.showNotification(title, {
        body: body,
        icon: '/icon_x192.png', // Ensure this file exists in public/
        data: payload.data
    });
})