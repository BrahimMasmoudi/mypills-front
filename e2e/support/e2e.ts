import { attachCustomCommands } from 'cypress-firebase'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'

const fbConfig = {
    "apiKey": "AIzaSyD8L9ygNvkH0FO46dceDGmneRwQ7WuaFBk",
    "authDomain": "my-pills-staging-460b5.firebaseapp.com",
    "projectId": "my-pills-staging-460b5",
    "storageBucket": "my-pills-staging-460b5.firebasestorage.app",
    "messagingSenderId": "824429090964",
    "appId": "1:824429090964:web:7e0cb8ae45c2424b8afc81",
    "measurementId": "G-SBR5TS02DD"
}

if (firebase.apps.length === 0) {
    firebase.initializeApp(fbConfig)
}

// FORCE client SDK to use the emulator
firebase.auth().useEmulator('http://localhost:9099')

attachCustomCommands({ Cypress, cy, firebase })