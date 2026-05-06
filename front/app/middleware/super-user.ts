import { useUserStore } from '~/store/userStore'

export default defineNuxtRouteMiddleware((to) => {
    const userStore = useUserStore()

    // If user is not logged in, auth.global.ts will handle it.
    // If user is logged in but not a super_user, redirect to home.
    if (userStore.user && !userStore.isSuperUser) {
        return navigateTo('/')
    }
})
