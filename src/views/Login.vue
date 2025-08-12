<template>
  <ion-page>
    <ion-header>
      <ion-toolbar><ion-title>Login</ion-title></ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
  <div style="height: 100%; display: flex; justify-content: center; align-items: center;">
    <ion-grid>
        <ion-row style="display: flex; justify-content: center; align-items: center;">
          <ion-col size="12" size-md="6" size-lg="6">
            <ion-list>
              <ion-item
                ><ion-input type="email" v-model="email" placeholder="Email"
              /></ion-item>
              <ion-item
                ><ion-input
                  type="password"
                  v-model="password"
                  placeholder="Password"
              /></ion-item>
            </ion-list>

            <ion-item lines="none">
              <ion-checkbox slot="start" v-model="remember" />
              <ion-label>Rimani connesso</ion-label>
            </ion-item>

            <ion-button expand="block" :disabled="loading" @click="submit"
              >Entra</ion-button
            >
            <div class="ion-text-center" style="margin-top: 12px; display: flex; align-items: center;">
              <ion-text>Non hai un account?</ion-text>
              <ion-button fill="clear" size="small" router-link="/register"
                >Registrati</ion-button
              >
            </div>

            <p v-if="error" style="color: var(--ion-color-danger)">
              {{ error }}
            </p>
          </ion-col>
        </ion-row>

    </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonGrid,
  IonRow,
  IonCol,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonCheckbox,
  IonLabel,
  IonText,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/lib/auth";

const router = useRouter();
const email = ref("");
const password = ref("");
const remember = ref(true);
const loading = ref(false);
const error = ref<string | null>(null);

const submit = async () => {
  error.value = null;
  loading.value = true;
  try {
    await login(email.value, password.value, remember.value);
    router.replace("/attendance");
  } catch (e: any) {
    error.value = "Credenziali non valide";
  } finally {
    loading.value = false;
  }
};
</script>
