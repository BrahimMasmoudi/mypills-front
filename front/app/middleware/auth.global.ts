import {getCurrentUser} from "vuefire";

export default defineNuxtRouteMiddleware(async (to) => {
    const user = await getCurrentUser()
    console.log(user)

    if (user && to.path === '/login') return

    if (!user && to.path !== '/login') navigateTo('/login')
})