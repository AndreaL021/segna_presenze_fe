<template>
  <ion-toast
    :is-open="canInstall && show"
    message="Installa l'app per accesso rapido"
    position="bottom"
    :duration="0"
    :buttons="[
      { text: 'Installa', role: 'confirm', handler: onInstall },
      { text: 'Chiudi', role: 'cancel', handler: () => show = false }
    ]"
  />
</template>

<script setup lang="ts">
import { IonToast } from '@ionic/vue'
import { ref, onMounted } from 'vue'
import { useA2HS, canInstall } from '@/lib/a2hs'

const { showPrompt } = useA2HS()
const show = ref(false)

onMounted(() => {
  // mostra dopo qualche secondo
  setTimeout(() => { show.value = true }, 1500)
})

async function onInstall() {
  await showPrompt()
  show.value = false
}
</script>
