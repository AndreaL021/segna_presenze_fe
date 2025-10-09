<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Utenti</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/attendance"
            ><fa-i style="font-size: 24px" icon="fa-solid fa-list" />
          </ion-button>
          <ion-button @click="doLogout"
            ><fa-i
              style="font-size: 24px"
              icon="fa-solid fa-right-from-bracket"
            ></fa-i
          ></ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar>
        <ion-searchbar
          v-model="search"
          :debounce="250"
          show-clear-button="focus"
          @ionClear="() => (search = '')"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- pulsante aggiungi utente -->
      <div style="display: flex; justify-content: center">
        <ion-button
          style="font-size: 24px; width: 200px"
          router-link="/register"
          v-if="sessionRole === 'admin'"
          ><fa-i style="padding: 5px" icon="fa-solid fa-user-plus"></fa-i
        ></ion-button>
      </div>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-list v-if="!loading && filtered.length">
        <!-- lista utenti -->
        <ion-item v-for="u in filtered" :key="u.id">
          <ion-label
            :router-link="'/attendance/' + u.id"
            style="cursor: pointer"
          >
            <h2>{{ u.name }}</h2>
            <p>{{ u.email }}</p>
            <small>Created: {{ new Date(u.createdAt).toLocaleString() }}</small>
          </ion-label>
          <ion-label style="display: flex; justify-content: end">
            <ion-buttons slot="end">
              <ion-button
                :router-link="'/edit/' + u.id"
                v-if="sessionRole === 'admin' || sessionUserId == u.id"
                ><fa-i style="font-size: 24px" icon="fa-solid fa-cog"></fa-i
              ></ion-button>
              <ion-button>
                <fa-i style="font-size: 24px" icon="fa-solid fa-file" />
              </ion-button>
              <ion-button @click="selectUser(u)" v-if="sessionRole === 'admin'"
                ><fa-i style="font-size: 24px" icon="fa-solid fa-trash"></fa-i
              ></ion-button>
            </ion-buttons>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list v-if="loading">
        <ion-item v-for="i in 8" :key="i"
          ><ion-label>Caricamento…</ion-label></ion-item
        >
      </ion-list>

      <div
        v-if="!loading && !filtered.length"
        class="ion-text-center ion-padding"
      >
        Nessun utente trovato
      </div>
    </ion-content>

    <ion-alert
      :is-open="delete_alert"
      header="Delete"
      :sub-header="user?.name || ''"
      message="Are you sure you want to delete the selected user?"
      :buttons="alertButtons"
      @didDismiss="delete_alert = false"
    />
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
  IonLabel,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  onIonViewWillEnter,
  IonAlert,
} from "@ionic/vue";
import { ref, onMounted, computed } from "vue";
import { listAllUsers, type User, deleteUser } from "@/lib/users";
import { logout } from "@/lib/auth";
import { useRouter } from "vue-router";
import { sessionRole, sessionUserId } from "@/lib/session";

const router = useRouter();
const allUsers = ref<User[]>([]);
const loading = ref(false);
const search = ref("");
const user = ref<User | null>(null);
const delete_alert = ref(false);
const alertButtons = [
  {
    text: "Cancel",
    role: "cancel",
    handler: () => {
      return;
    },
  },
  {
    text: "OK",
    role: "confirm",
    handler: async () => {
      await elimina();
      return true;
    },
  },
];

const selectUser = (u: User) => {
  user.value = u;
  delete_alert.value = true;
};

const elimina = async () => {
  if (!user.value) return;
  await deleteUser(user.value.id);
  await loadAll();
  delete_alert.value = false;
  // router.replace("/login");
};

const doLogout = async () => {
  await logout();
  router.replace("/login");
};

async function handleRefresh(e: any) {
  await loadAll();
  e.target.complete();
}

// Carica TUTTI gli utenti una volta (ciclando le pagine del BE)
async function loadAll() {
  loading.value = true;
  try {
    const all = await listAllUsers({ sortBy: "createdAt", sortDir: "DESC" });
    allUsers.value = all;
  } finally {
    loading.value = false;
  }
}

// Filtro locale
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return allUsers.value;
  return allUsers.value.filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );
});

onMounted(loadAll);
// 2) ogni volta che torni su questa vista
onIonViewWillEnter(loadAll);
</script>
