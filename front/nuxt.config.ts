// https://nuxt.com/docs/api/configuration/nuxt-config
import vueI18n from '@intlify/unplugin-vue-i18n/vite'

export default defineNuxtConfig({
  compatibilityDate: "2024-08-12",
  future: {
    compatibilityVersion: 4,
  },
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
    head: {title: 'MyEfficiency'},
    viewTransition: true
  },
  typescript: {strict: true},
  ssr: false,
  modules: [
    'vuetify-nuxt-module',
    'nuxt-lodash',
    'nuxt-icons',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/device',
  ],
  device: {
    refreshOnResize: true
  },
  piniaPersistedstate: {
    storage: 'localStorage'
  },
  runtimeConfig: {
    apiSecret: '123', // can be overridden by NUXT_API_SECRET environment variable
    public: {
      apiBase: 'http://localhost:8080',
      env: 'localhost',
      version: 'local',
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
    plugins: [vueI18n({defaultSFCLang: 'yaml'}),]
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
  }
})
