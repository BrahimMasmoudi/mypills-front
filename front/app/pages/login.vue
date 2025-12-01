<template>
    <v-sheet class="fill-height landing-page d-flex justify-center align-center pa-0">
            <v-card v-if="$device.isDesktop" class="elevation-12 rounded-xl pa-4">
              <v-card-title class="text-h3 font-weight-bold text-center text-primary">
                <nuxt-icon filled name="application-icon" class="app-icon"/>
                {{ t('landing.title') }}
              </v-card-title>
              <v-card-subtitle class="text-h6 text-center text-wrap">
                {{ t('landing.subtitle') }}
              </v-card-subtitle>

              <v-card-text>
                <v-list density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="success" icon="mdi-calendar-clock"/>
                    </template>
                    <v-list-item-title class="text-body-1">{{ t('landing.features.expiry') }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="info" icon="mdi-pill"/>
                    </template>
                    <v-list-item-title class="text-body-1">{{ t('landing.features.inventory') }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="warning" icon="mdi-cellphone"/>
                    </template>
                    <v-list-item-title class="text-body-1">{{ t('landing.features.access') }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>

              <v-card-actions class="justify-center">
                <v-btn
                    @click.prevent="login"
                    color="primary"
                    size="x-large"
                    variant="flat"
                    block
                    class="text-capitalize font-weight-bold"
                >
                  <template #prepend>
                    <nuxt-icon filled name="google" class="mr-2"/>
                  </template>
                  {{ t('login.google') }}
                </v-btn>
              </v-card-actions>
            </v-card>

            <v-card v-else class="elevation-12 rounded-xl pa-3 pa-sm-4" style="width: 90%;">

            <!-- Title -->
            <v-card-title
              class="font-weight-bold text-center text-primary text-h4 text-sm-h3"
            >
            <nuxt-icon filled name="application-icon" class="app-icon-mobile"/>
               {{ t('landing.title') }}
            </v-card-title>

            <!-- Subtitle -->
            <v-card-subtitle
              class="text-center text-subtitle-1 text-sm-h6 text-wrap"
            >
              {{ t('landing.subtitle') }}
            </v-card-subtitle>

            <!-- Features -->
            <v-card-text class="px-1 px-sm-4">
              <v-list density="comfortable">
                <v-list-item>
                  <template #prepend>
                    <v-icon size="20" size-sm="24" color="success" icon="mdi-calendar-clock"/>
                  </template>
                  <v-list-item-title class="text-body-2 text-sm-body-1">
                    {{ t('landing.features.expiry') }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon size="20" size-sm="24" color="info" icon="mdi-pill"/>
                  </template>
                  <v-list-item-title class="text-body-2 text-sm-body-1">
                    {{ t('landing.features.inventory') }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon size="20" size-sm="24" color="warning" icon="mdi-cellphone"/>
                  </template>
                  <v-list-item-title class="text-body-2 text-sm-body-1">
                    {{ t('landing.features.access') }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>

            <!-- Login button -->
            <v-card-actions class="justify-center">
              <v-btn
                @click.prevent="login"
                color="primary"
                size="large"
                variant="flat"
                block
                class="text-capitalize font-weight-bold"
              >
                <template #prepend>
                  <nuxt-icon filled name="google" class="mr-2"/>
                </template>
                {{ t('login.google') }}
              </v-btn>
            </v-card-actions>

          </v-card>

       </v-sheet>
</template>

<script lang="ts" setup>
import {useUserStore} from "~/store/userStore";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const userStore = useUserStore()

definePageMeta({
  layout: false,
})

if (userStore.user) navigateTo('/all')

const login = async () => {
  await userStore.login()
  navigateTo('/all')
}
</script>

<style scoped>
.landing-page {
background: url('~/assets/img/background.png') no-repeat center center;
background-size: cover;
  min-height: 100vh;
}

:deep(svg) {
  width: 24px !important;
  height: 24px !important;
}

.app-icon >>> svg {
  width: 48px !important;
  height: 48px !important;
}

.app-icon-mobile >>> svg {
  width: 36px !important;
  height: 36px !important;
}
</style>