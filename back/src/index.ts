import { initializeApp } from 'firebase-admin/app'

initializeApp()
export * from './infrastructure/entry-points/https-functions'
export * from './infrastructure/config/firebase'