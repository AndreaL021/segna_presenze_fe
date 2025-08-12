<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Presenze</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/users" v-if="sessionRole==='admin'">Utenti</ion-button>
          <ion-button @click="doLogout">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-buttons slot="start"
          ><ion-button @click="prevMonth">◀︎</ion-button></ion-buttons
        >
        {{ titleMonth }}
        <ion-buttons slot="end"
          ><ion-button @click="nextMonth">▶︎</ion-button></ion-buttons
        >
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item v-for="d in daysList" :key="d.date">
          <ion-label>
            <h2>{{ d.date }} ({{ d.weekday }})</h2>
            <p v-if="map[d.date]?.note">{{ map[d.date]?.note }}</p>
          </ion-label>

          <ion-select
            interface="popover"
            :value="map[d.date]?.status || ''"
            v-if="!viewedUserId"
            placeholder="—"
            @ionChange="(e) => changeStatus(d.date, e.detail.value)"
          >
            <ion-select-option value="present">Presente</ion-select-option>
            <ion-select-option value="absent">Assente</ion-select-option>
            <ion-select-option value="remote">Remoto</ion-select-option>
            <ion-select-option value="leave">Permesso</ion-select-option>
            <ion-select-option value="">(vuoto)</ion-select-option>
          </ion-select>
          <p v-else>
            {{
              map[d.date]?.status == "present"
                ? "Presente"
                : map[d.date]?.status == "absent"
                ? "Assente"
                : map[d.date]?.status == "remote"
                ? "Remoto"
                : map[d.date]?.status == "leave"
                ? "permesso"
                : "(vuoto)"
            }}
          </p>
        </ion-item>
      </ion-list>
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
  IonSelect,
  IonSelectOption,
  onIonViewWillEnter
} from "@ionic/vue";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCalendar, updateByDate, type DayEntry } from "@/lib/attendance";
import { logout } from "@/lib/auth";
import { sessionRole } from "@/lib/session";

const router = useRouter();
const route = useRoute();
const viewedUserId = ref<number | null>(null); // già gestito per /attendance/:userId, se vuoi puoi mantenerlo solo per mostrare "read-only"
const current = ref(new Date()); // mese mostrato
const map = ref<Record<string, DayEntry>>({});
const loading = ref(false);

const titleMonth = computed(() =>
  current.value.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })
);
const daysList = computed(() => {
  const year = current.value.getFullYear();
  const month = current.value.getMonth(); // 0-based
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const arr: { date: string; weekday: string }[] = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    arr.push({
      date: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    });
  }
  return arr;
});

async function load() {
  loading.value = true;
  try {
    // calcola range mese corrente
    const year = current.value.getFullYear();
    const month = current.value.getMonth();
    const from = new Date(year, month, 1).toISOString().slice(0, 10);
    const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    const data = await getCalendar({ from, to, userId:viewedUserId.value ?? undefined, });
    map.value = data.days || {};
  } finally {
    loading.value = false;
  }
}

function prevMonth() {
  current.value = new Date(
    current.value.getFullYear(),
    current.value.getMonth() - 1,
    1
  );
}
function nextMonth() {
  current.value = new Date(
    current.value.getFullYear(),
    current.value.getMonth() + 1,
    1
  );
}

async function changeStatus(date: string, val: string) {
  // se selezioni vuoto, puoi decidere se cancellare record (qui mettiamo note vuota e niente status → opzionale)
  if (!val) {
    // per semplicità: imposta assenza di stato = rimuovi record? (serve endpoint DELETE by date se vuoi)
    // Qui invece azzeriamo localmente:
    map.value[date] = {};
    return;
  }
  await updateByDate({ date, status: val as any });
  // aggiorna localmente per UX snappy
  map.value[date] = { ...(map.value[date] || {}), status: val as any };
}

const doLogout = async () => {
  await logout();
  router.replace("/login");
};

onMounted(() => {
  const idParam = route.params.userId as string | undefined;
  viewedUserId.value = idParam ? Number(idParam) : null; // solo per abilitare/disabilitare edit
  load();
});
// 2) ogni volta che torni su questa vista
onIonViewWillEnter(() => {
  const idParam = route.params.userId as string | undefined;
  viewedUserId.value = idParam ? Number(idParam) : null; // solo per abilitare/disabilitare edit
  load();
})

watch(current, load);
watch(
  () => route.params.userId,
  () => {
    viewedUserId.value = route.params.userId
      ? Number(route.params.userId)
      : null;
    load();
  }
);
</script>