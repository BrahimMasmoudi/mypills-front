<template>
  <v-dialog v-model="isOpen" max-width="500" persistent>
    <v-card class="rounded-xl">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6 mx-auto font-weight-bold">{{ t('scanner.title') }}</span>
        <v-btn icon="mdi-close" variant="text" @click="close"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-0 position-relative">
        <div id="reader" class="scanner-container"></div>
        
        <v-overlay
          v-model="isLoading"
          contained
          class="align-center justify-center"
        >
          <v-progress-circular indeterminate color="white"></v-progress-circular>
        </v-overlay>
      </v-card-text>

      <v-card-text class="pa-4 text-center text-caption text-medium-emphasis">
        <div class="d-flex flex-column align-center gap-2">
            <div class="d-flex align-center text-body-2 font-weight-medium mb-2">
                <v-icon icon="mdi-information" color="primary" class="mr-2" size="small"></v-icon>
                {{ t('scanner.gs1_only') }}
            </div>
            
            <v-sheet>
              <suspense>
              <nuxt-icon name="gs1-datamatrix" filled class="gs1-icon" />
              </suspense>
            </v-sheet>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const modelValue = defineModel()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'detect', code: string): void
}>()

const isOpen = computed({
  get: () => modelValue.value,
  set: (val) => modelValue.value = val,
})

const isLoading = ref(true)
let html5QrCode: Html5Qrcode | null = null
const isOpInProgress = ref(false)

const startScanning = async () => {
    if (isOpInProgress.value || html5QrCode?.isScanning) return;
    
    isOpInProgress.value = true
    isLoading.value = true
    await nextTick()
    
    try {
        // Ensure cleanup if previous instance hung around
        if (!html5QrCode) {
             html5QrCode = new Html5Qrcode("reader")
        }

        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [ 
                Html5QrcodeSupportedFormats.DATA_MATRIX,
                Html5QrcodeSupportedFormats.EAN_13 
            ]
        }
        
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                emit('detect', decodedText)
                close()
            },
            (errorMessage) => {
                // scanning...
            }
        )
    } catch (err) {
        console.error("Error starting scanner", err)
    } finally {
        isLoading.value = false
        isOpInProgress.value = false
        
        // If dialog was closed while starting, stop now
        if (!isOpen.value) {
            stopScanning()
        }
    }
}

const stopScanning = async () => {
    if (isOpInProgress.value) return; // Prevent stopping while starting
    
    if (html5QrCode && html5QrCode.isScanning) {
        isOpInProgress.value = true
        try {
            await html5QrCode.stop()
            html5QrCode.clear()
            html5QrCode = null // Thorough cleanup
        } catch (err) {
            console.error("Failed to stop scanner", err)
        } finally {
            isOpInProgress.value = false
        }
    }
}

const close = () => {
    stopScanning()
    isOpen.value = false
}

// Watch for dialog opening to start scanner
watch(isOpen, (newVal) => {
    if (newVal) {
        startScanning()
    } else {
        stopScanning()
    }
})

// Cleanup
onBeforeUnmount(() => {
    stopScanning()
})
</script>

<style scoped>

.scanner-container {
    width: 100%;
    min-height: 300px;
    background: #000;
}

.gs1-icon :deep(svg) {
  width: 36px;
  height: 36px;
}


/* Ensure the icon container has the right text color */
.gs1-icon {
  color: #1e293b; /* Light mode dots color */
}

/* The background rect inside the SVG */
.gs1-icon :deep(.gs1-bg) {
  fill: #ffffff; /* White background in light mode */
  fill-opacity: 1;
}

/* DARK MODE OVERRIDES */
.dark-mode .gs1-icon {
  color: black; /* Emerald dots look high-tech in dark mode */
}

.dark-mode .gs1-icon :deep(.gs1-bg) {
  /* In dark mode, we make the background dark slate */
  fill: #0f172a;
  fill-opacity: 1;
}
</style>
