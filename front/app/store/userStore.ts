import { defineStore } from 'pinia'
import { GoogleAuthProvider, signInWithPopup, signOut, type User, type UserCredential } from '@firebase/auth'
import { useFirebaseAuth, useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'
import { ref, computed } from 'vue'
import type { UserProfile } from '~/types/user'

export const useUserStore = defineStore('userStore', () => {
    const firestore = useFirestore()
    const auth = useFirebaseAuth()
    const userCredentials = ref<UserCredential>()
    const user = ref<User>()

    // Profile source and data
    const userDocSource = computed(() => user.value ? doc(firestore, 'users', user.value.uid) : null)
    const { data: profile } = useDocument<UserProfile>(userDocSource)

    const isSuperUser = computed(() => profile.value?.role === 'super_user')

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
        profile,
        isSuperUser,
    }
}, { persist: { paths: ['user'] } })
