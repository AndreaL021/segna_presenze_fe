<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Edit {{ user.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/users"
            ><fa-i style="font-size: 24px" icon="fa-solid fa-users"
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
            <ion-input
              v-model="user.name"
              label="Name"
              label-placement="floating"
            />
          </ion-item>
          <ion-item>
            <ion-input
              type="email"
              v-model="user.email"
              label="Email"
              label-placement="floating"
            />
          </ion-item>
          <!-- <ion-item v-if="sessionRole!='admin'">
            <ion-input
              :type="type"
              v-model="password"
              label="Old Password"
              label-placement="floating"
            />
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
          </ion-item> -->
          <ion-item>
            <ion-input
              :type="type"
              v-model="password"
              label="New Password"
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
          <ion-item v-if="sessionRole === 'admin'">
            <ion-select
              label="Ruolo"
              interface="popover"
              v-model="role"
            >
              <ion-select-option value="admin">Admin</ion-select-option>
              <ion-select-option value="user">Utente</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>

        <ion-button
          expand="block"
          :disabled="loadingState || !user.name || !user.email"
          @click="submit"
        >
          Update
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
  IonSelect,
  IonItem,
  IonInput,
  onIonViewWillEnter,
} from "@ionic/vue";
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { logout } from "@/lib/auth";
import { getUser, updateUser, User } from "@/lib/users";
import { errorToast } from "@/lib/notify";
import { sessionRole } from "@/lib/session";

const router = useRouter();
const route = useRoute();
const type = ref("password");
const role = ref<'user' | 'admin'>('user');
const password = ref("");
const loadingState = ref(false);
const error = ref<string | null>(null);
const userId = ref<number | null>(null);
const user = reactive<User>({
  id: 0,
  name: "",
  email: "",
  createdAt: "",
  role: "user",
});

const submit = async () => {
  error.value = null;
  loadingState.value = true;
  user.role= role.value
  try {
    if (!user.id || !user.role || !user.name || !user.email) {
      if (!user.id || !user.role) {
        throw new Error("Errore, ricaricare la pagina");
      }
      throw new Error("Compila tutti i campi");
    }
    await updateUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: password.value,
      role: user.role,
    });
    // UX: torna alla lista utenti
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
// 2) ogni volta che torni su questa vista
onIonViewWillEnter(() => {
  const idParam = route.params.userId as string | undefined;
  userId.value = idParam ? Number(idParam) : null; // solo per abilitare/disabilitare edit
  load();
});

async function load() {
  error.value = null;
  loadingState.value = true;
  try {
    if (!userId.value) return;

    const u = await getUser(userId.value);
    Object.assign(user, u);
    role.value=u.role
    if (!user.id) {
      throw new Error(
        "Errore durante il caricamento dei dati, ricaricare la pagina"
      );
    }
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.message ??
      "Errore durante il caricamento";
    error.value = msg;
    // mostra il toast “a mano”
    errorToast.show(msg);
  } finally {
    loadingState.value = false;
  }
}
</script>
