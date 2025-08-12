<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Utenti</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/attendance">Presenze</ion-button>
          <ion-button @click="doLogout">Logout</ion-button>
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
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-list v-if="!loading && filtered.length">
        <ion-item v-for="u in filtered" :key="u.id">
          <ion-label :router-link="'/attendance/'+u.id">
            <h2>{{ u.name }}</h2>
            <p>{{ u.email }}</p>
            <small>Creato: {{ new Date(u.createdAt).toLocaleString() }}</small>
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
} from "@ionic/vue";
import { ref, onMounted, computed } from "vue";
import { listAllUsers, type User } from "@/lib/users";
import { logout } from "@/lib/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const allUsers = ref<User[]>([]);
const loading = ref(false);
const search = ref("");

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
</script>
