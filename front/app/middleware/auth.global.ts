import { getCurrentUser } from 'vuefire'

export default defineNuxtRouteMiddleware(async (to) => {
    const user = await getCurrentUser()

    if (user && to.path === '/login') {
        return navigateTo('/')
    }

    if (!user && to.path !== '/login') {
        return navigateTo('/login')
    }
})
