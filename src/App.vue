<template>
  <ion-app>
    <ion-router-outlet />
    <!-- Overlay globale -->
    <ion-loading
      :is-open="isLoading"
      message="Caricamento…"
      spinner="crescent"
      translucent
    />
    <!-- toast errori -->
    <ion-toast
      :is-open="open"
      :message="message"
      :duration="4000"
      color="danger"
      position="top"
      @didDismiss="close"
    />
    <!-- toast aggiornamento -->
    <ion-toast
      :is-open="upd.state.open"
      message="Nuova versione disponibile"
      position="bottom"
      :duration="0"
      :buttons="[
        { text: 'Aggiorna', role: 'confirm', handler: upd.updateNow },
        { text: 'Più tardi', role: 'cancel', handler: upd.close },
      ]"
    />
    <InstallBanner />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonLoading, IonToast } from "@ionic/vue";
import { computed, onMounted } from "vue";
import { loading } from "@/lib/loading";
import { errorToast } from "@/lib/notify";
import { showUpdateBanner as upd } from "@/lib/pwa-update";
import InstallBanner from "@/components/InstallBanner.vue";
import { loadRoleFromToken } from "@/lib/session";

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone =
  (window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches) ||
  (window as any).navigator.standalone;
// se iOS e non standalone, mostra un tooltip con le istruzioni di installazione

const isLoading = computed(() => loading.isLoading.value);
const open = errorToast.open;
const message = errorToast.message;
const close = errorToast.close;

// Carica il ruolo quando l'app è montata
onMounted(async () => {
  await loadRoleFromToken();
});
</script>
<style>
</style>
