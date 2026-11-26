import type { NuxtApp } from '#app'

declare module 'vue' {
    interface ComponentCustomProperties {
        $device: NuxtApp['$device']
        $colorMode: NuxtApp['$colorMode']
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $device: NuxtApp['$device']
        $colorMode: NuxtApp['$colorMode']
    }
}
