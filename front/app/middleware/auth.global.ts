import {useUserStore} from "~/store/userStore";
import {getCurrentUser} from "vuefire";

export default defineNuxtRouteMiddleware(async (to) => {
    const user = await getCurrentUser()

    if (user && to.path === '/login') return

    if (!user && to.path !== '/login') navigateTo('/login')
})