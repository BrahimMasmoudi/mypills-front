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
        // Create a unique container for this dialog instance
        const container = document.createElement('div')
        container.setAttribute('data-dialog-container', `dialog-${Date.now()}-${Math.random()}`)
        const appWrap = document.querySelector('.v-application__wrap')
        if (appWrap) {
            appWrap.appendChild(container)
        } else {
            document.body.appendChild(container)
        }

        const result = await new Promise((resolve) => {
            const vNode: VNode | null = createVNode(component, {
                ...props,
                close: (returnValue: any) => {
 resolve(returnValue)
},
            }, slot)
            vNode.appContext = app._context
            render(vNode, container)
        })

        // Clean up only this dialog's container
        setTimeout(() => {
            render(null, container)
            container.remove()
        }, 200)

        return result
    }
    provide('open', $open(vueApp))
})
