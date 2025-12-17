<template>
  <v-dialog v-model="isOpen" max-width="500" persistent>
    <v-card class="rounded-xl">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6 font-weight-bold">Scan Barcode</span>
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
        Point your camera at the DataMatrix or CIP13 barcode on the box.
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'detect', code: string): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isLoading = ref(true)
let html5QrCode: Html5Qrcode | null = null

const startScanning = async () => {
    isLoading.value = true
    await nextTick() // Wait for DOM element #reader to exist
    
    try {
        html5QrCode = new Html5Qrcode("reader")
        
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
                console.log('decodedText,',decodedText)
                // Success callback
                stopScanning()
                emit('detect', decodedText)
                close()
            },
            (errorMessage) => {
                // Error callback (scanning in progress)
                // console.log(errorMessage)
            }
        )
        isLoading.value = false
    } catch (err) {
        console.error("Error starting scanner", err)
        isLoading.value = false
        // Handle permission errors etc.
    }
}

const stopScanning = async () => {
    if (html5QrCode) {
        try {
            await html5QrCode.stop()
            html5QrCode.clear()
            html5QrCode = null
        } catch (err) {
            console.error("Failed to stop scanner", err)
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
</style>
