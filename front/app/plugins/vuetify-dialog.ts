import type { App, Component } from 'vue'
import { createVNode, render } from 'vue'

declare module '#app' {
    interface NuxtApp {
        $open: <T = any>(component: Component, props?: Record<string, any>, slot?: unknown) => Promise<T>
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $open: <T = any>(component: Component, props?: Record<string, any>, slot?: unknown) => Promise<T>
    }
}

export default defineNuxtPlugin(({ vueApp, provide }) => {
    const $open = (app: App<Element>) => async (component: Component, props?: Record<string, any>, slot?: unknown) => {
        let el: HTMLElement | null = null
        const result = await new Promise((resolve) => {
            const vNode: VNode | null = createVNode(component, {
                ...props,
                close: (returnValue: any) => { resolve(returnValue) },
            }, slot)
            vNode.appContext = app._context
            render(vNode, el = document.querySelector('.v-sheet')! ?? document.querySelector('.v-application__wrap'))
        })
        setTimeout(() => render(null, el!), 200)
        return result
    }
    provide('open', $open(vueApp))
})