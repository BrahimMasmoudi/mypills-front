import {defineStore} from 'pinia'
import {GoogleAuthProvider, signInWithPopup, signOut, type User, type UserCredential} from "@firebase/auth";
import {useFirebaseAuth} from "vuefire"
import { httpsCallable } from 'firebase/functions';

export const useUserStore = defineStore('userStore', () => {
    const auth = useFirebaseAuth()
    const {$functions} = useNuxtApp()
    const userCredentials = ref<UserCredential>()
    const user = ref<User>()
    const login = async () => {
        userCredentials.value = await signInWithPopup(auth, new GoogleAuthProvider())
        user.value = userCredentials.value?.user
    }

    const callFunction = async () => {
        const helloWorld = httpsCallable($functions, 'helloWorld')
        const result = await helloWorld()
        console.log('hello world', result)
    }

    const logOut = async () => {
        await signOut(auth)
        user.value = undefined
    }

    return {
        login,
        logOut,
        callFunction,
        userCredentials,
        user
    }
}, {persist: {paths: ['user']}})
