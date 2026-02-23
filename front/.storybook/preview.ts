import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { createI18n } from 'vue-i18n';
import fr from '../app/locales/fr.json';
import en from '../app/locales/en.json';

// Vuetify imports
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';

import { INITIAL_VIEWPORTS } from 'storybook/viewport';

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  messages: { fr, en },
  locale: 'fr',
  fallbackLocale: 'fr',
});

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3643BA',
          'dark-primary': '#2E399E',
          gray: '#a0a0a0',
          'dark-gray': '#4E5D6BCC',
          'primary-light': '#D9ECF5',
          'light-blue': '#9ADDFF',
          'completed': '#149B65',
          'in_progress': '#0113B6FF',
          'to_be_processed': '#EC6607',
          yes: '#149B65',
          no: '#ff0000',
          'not-concerned': '#3643BA'
        }
      }
    }
  }
});

setup((app) => {
  app.use(i18n);
  app.use(vuetify);

  // Mock Nuxt-specific globals
  const nuxtAppMock = {
    $device: {
      isDesktop: true,
      isMobile: false,
      isTablet: false,
    },
    $open: async () => { },
    $colorMode: {
      value: 'light',
      preference: 'light',
    },
    runWithContext: (fn: any) => fn(),
  };

  app.provide('__nuxt_app', nuxtAppMock);

  app.config.globalProperties.$device = nuxtAppMock.$device;
  app.config.globalProperties.$open = nuxtAppMock.$open;
  app.config.globalProperties.$colorMode = nuxtAppMock.$colorMode;
});

const preview: Preview = {
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;