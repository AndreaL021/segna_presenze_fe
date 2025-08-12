<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Crea utente</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/users">Utenti</ion-button>
          <ion-button router-link="/attendance">Presenze</ion-button>
          <ion-button @click="doLogout">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div style="max-width: 560px; margin: 0 auto;">
        <ion-list>
          <ion-item>
            <ion-input v-model="name" label="Nome completo" label-placement="floating" />
          </ion-item>
          <ion-item>
            <ion-input type="email" v-model="email" label="Email" label-placement="floating" />
          </ion-item>
          <ion-item>
            <ion-input type="text" v-model="password" label="Password" label-placement="floating" />
          </ion-item>
        </ion-list>

        <ion-button expand="block" :disabled="loadingState || !name || !email || !password" @click="submit">
          Crea utente
        </ion-button>

        <p v-if="error" style="color: var(--ion-color-danger); margin-top: 12px;">
          {{ error }}
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonInput
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { logout } from "@/lib/auth";
import { createUser } from "@/lib/users"; // 👈 nuova funzione
import { errorToast } from "@/lib/notify"; // se vuoi mostrare un toast di errore

const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const loadingState = ref(false);
const error = ref<string | null>(null);

const submit = async () => {
  error.value = null;
  loadingState.value = true;
  try {
    if (!name.value || !email.value || !password.value) {
      throw new Error("Compila tutti i campi");
    }
    await createUser({ name: name.value, email: email.value, password: password.value });

    // UX: torna alla lista utenti
    // (in alternativa: pulisci il form e resta qui)
    router.replace("/users");
} catch (e: any) {
  const msg = e?.response?.data?.message ?? e?.message ?? 'Errore creazione utente';
  error.value = msg;
  // mostra il toast “a mano”
  errorToast.show(msg)
} finally {
    loadingState.value = false;
  }
};

const doLogout = async () => {
  await logout();
  router.replace("/login");
};
</script>
