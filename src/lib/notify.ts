// lib/notify.ts
import { reactive, computed } from 'vue';

const state = reactive({
  message: '' as string,
  open: false,
});

export function showError(msg: string) {
  state.message = msg;
  state.open = true;
}

export function closeError() {
  state.open = false;
}

export const errorToast = {
  open: computed(() => state.open),
  message: computed(() => state.message),
  close: () => closeError(),
  show: (msg: string) => showError(msg), 
};
