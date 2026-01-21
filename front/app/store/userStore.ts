import { defineStore } from 'pinia'
import { GoogleAuthProvider, signInWithPopup, signOut, type User, type UserCredential } from '@firebase/auth'
import { useFirebaseAuth } from 'vuefire'

export const useUserStore = defineStore('userStore', () => {
    const auth = useFirebaseAuth()
    const userCredentials = ref<UserCredential>()
    const user = ref<User>()
    const login = async () => {
        userCredentials.value = await signInWithPopup(auth!, new GoogleAuthProvider())
        user.value = userCredentials.value?.user
    }

    const logOut = async () => {
        await signOut(auth!)
        user.value = undefined
    }

    return {
        login,
        logOut,
        userCredentials,
        user,
    }
}, { persist: { paths: ['user'] } })
