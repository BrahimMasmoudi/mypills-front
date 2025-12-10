// https://nuxt.com/docs/api/configuration/nuxt-config
import vueI18n from '@intlify/unplugin-vue-i18n/vite'

export default defineNuxtConfig({
    experimental: {
        viewTransition: true
    },
    devtools: {
        enabled: true,
        timeline: {
            enabled: true
        }
    },
    devServerHandlers: [],
    app: {
        head: { title: 'MyPills' },
        viewTransition: true
    },
    typescript: { strict: true },
    ssr: false,
    modules: [
        'vuetify-nuxt-module',
        'nuxt-lodash',
        'nuxt-icons',
        '@pinia/nuxt',
        '@pinia-plugin-persistedstate/nuxt',
        '@nuxtjs/device',
        'nuxt-vuefire',
        '@nuxt/ui',
        '@vite-pwa/nuxt'
    ],
    device: {
        refreshOnResize: true
    },
    piniaPersistedstate: {
        storage: 'localStorage'
    },
    vuefire: {
        auth: {
            enabled: true,
            sessionCookie: false
        },
        analytics: {
            enabled: ['production', 'staging'].includes(process.env.ENVIRONMENT || '')
        },
        firestore: {
            enable: true,
        },
        config: {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID
        },
    },

    runtimeConfig: {
        apiSecret: '123', // can be overridden by NUXT_API_SECRET environment variable
        public: {
            apiBase: 'http://localhost:8080',
            env: 'localhost',
            version: 'local',
            firebase: {
                firestore: {
                    enable: true,
                },
                functions: {
                    enable: true,
                    location: 'europe-west3',
                    enableEmulator: process.env.NODE_ENV !== 'production',
                    emulatorPort: 5001,
                    emulatorHost: '127.0.0.1',
                },
                analytics: {
                    enable: ['production', 'staging'].includes(process.env.ENVIRONMENT!),
                }
            },
        }
    },
    css: ['~/assets/scss/main.scss'],
    sourcemap: {
        server: false,
        client: true
    },
    vite: {
        build: {
            sourcemap: true,
        },
        vue: {
            script: {
                defineModel: true,
                propsDestructure: true,
            },
        },
        plugins: [vueI18n({ defaultSFCLang: 'yaml' }),]
    },
    vuetify: {
        vuetifyOptions: {
            theme: {
                themes: {
                    light: {
                        colors: {
                            primary: '#3643BA',
                            "dark-primary": '#2E399E',
                            gray: '#a0a0a0',
                            'dark-gray': '#4E5D6BCC',
                            "primary-light": '#D9ECF5',
                            "light-blue": '#9ADDFF',
                            'completed': '#149B65',
                            'in_progress': '#0113B6FF',
                            'to_be_processed': '#EC6607',
                            yes: '#149B65',
                            no: '#ff0000',
                            'not-concerned': '#3643BA'
                        }
                    },
                }
            },
        }
    },
    ui: {
        // @ts-ignore
        fonts: false
    },
    pwa: {
        registerType: 'autoUpdate',
        manifest: {
            name: 'MyPills - Medication Manager',
            short_name: 'MyPills',
            description: 'Manage your medications easily and never miss a dose',
            start_url: '/',
            display: 'standalone',
            theme_color: '#3643BA',
            background_color: '#ffffff',
            icons: [
                {
                    src: '/icon-48x48.png',
                    sizes: '48x48',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/icon-72x72.png',
                    sizes: '72x72',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/icon-96x96.png',
                    sizes: '96x96',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/icon-128x128.png',
                    sizes: '128x128',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/icon-144x144.png',
                    sizes: '144x144',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any maskable'
                },
                {
                    src: '/icon-384x384.png',
                    sizes: '384x384',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/icon-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'
                }
            ]
        },
        workbox: {
            navigateFallback: '/',
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        },
        client: {
            installPrompt: true,
        },
        devOptions: {
            enabled: true,
            type: 'module',
        },
    },
    nitro: {
        preset: 'firebase-hosting'
    }
})
