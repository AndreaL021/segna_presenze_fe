<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Create user</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/users"
            ><fa-i style="font-size: 24px" icon="fa-solid fa-users"
          /></ion-button>
          <ion-button router-link="/attendance"
            ><fa-i style="font-size: 24px" icon="fa-solid fa-list"
          /></ion-button>
          <ion-button @click="doLogout"
            ><fa-i
              style="font-size: 24px"
              icon="fa-solid fa-right-from-bracket"
          /></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div style="max-width: 560px; margin: 0 auto">
        <ion-list>
          <ion-item>
            <ion-input v-model="name" label="Name" label-placement="floating" />
          </ion-item>
          <ion-item>
            <ion-input
              type="email"
              v-model="email"
              label="Email"
              label-placement="floating"
            />
          </ion-item>
          <ion-item>
            <ion-input
              :type="type"
              v-model="password"
              label="Password"
              label-placement="floating"
            />
            <!-- icona occhio -->
            <fa-i
              v-if="type === 'password'"
              style="font-size: 24px; cursor: pointer"
              icon="fa-solid fa-eye"
              @click="togglePassword"
            />
            <fa-i
              v-else
              style="font-size: 24px; cursor: pointer"
              icon="fa-solid fa-eye-slash"
              @click="togglePassword"
            />
          </ion-item>
          <ion-item>
            <ion-select label="Ruolo" interface="popover" v-model="role">
              <ion-select-option value="admin">Admin</ion-select-option>
              <ion-select-option value="user">Utente</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>

        <ion-button
          expand="block"
          :disabled="
            loadingState ||
            !name ||
            !email ||
            !password ||
            sessionRole != 'admin'
          "
          @click="submit"
        >
          Register
        </ion-button>

        <p
          v-if="error"
          style="color: var(--ion-color-danger); margin-top: 12px"
        >
          {{ error }}
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { logout } from "@/lib/auth";
import { createUser } from "@/lib/users";
import { errorToast } from "@/lib/notify";
import { sessionRole } from "@/lib/session";
import type { TextFieldTypes } from "@ionic/core";

const router = useRouter();
const name = ref("");
const email = ref("");
const role = ref<"user" | "admin">("user");
const type = ref<TextFieldTypes>("password");
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
    await createUser({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
    });

    // UX: torna alla lista utenti
    // (in alternativa: pulisci il form e resta qui)
    router.replace("/users");
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ?? e?.message ?? "Errore creazione utente";
    error.value = msg;
    // mostra il toast “a mano”
    errorToast.show(msg);
  } finally {
    loadingState.value = false;
  }
};

const doLogout = async () => {
  await logout();
  router.replace("/login");
};

const togglePassword = () => {
  type.value = type.value === "password" ? "text" : "password";
};
</script>
