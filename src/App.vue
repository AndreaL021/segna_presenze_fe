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
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonLoading } from '@ionic/vue';
import { computed } from 'vue';
import { loading } from '@/lib/loading';

const isLoading = computed(() => loading.isLoading.value);
</script>
