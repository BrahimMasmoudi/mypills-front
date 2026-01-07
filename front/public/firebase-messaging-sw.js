importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyD8L9ygNvkH0FO46dceDGmneRwQ7WuaFBk",
    authDomain: "my-pills-staging-460b5.firebaseapp.com",
    projectId: "my-pills-staging-460b5",
    storageBucket: "my-pills-staging-460b5.firebasestorage.app",
    messagingSenderId: "824429090964",
    appId: "1:824429090964:web:7e0cb8ae45c2424b8afc81",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

console.log('WORKER')

// This is the magic part for background clicks
messaging.onBackgroundMessage((payload) => {
    console.log('Background message:', payload);

    // If the payload has a 'notification' property, the browser
    // usually handles it, but you can manually trigger it here:
    // const notificationTitle = payload.data?.title || 'New Message';
    // const notificationOptions = {
    //     body: payload.data?.body ?? 'New Message',
    //     icon: '/favicon.ico', // Ensure this path is correct in your /public folder
    //     data: payload.data ?? '' // Useful for clicking the notification
    // };
    //
    // self.registration.showNotification(notificationTitle, notificationOptions);
});