import { reactive, computed } from 'vue';

const state = reactive({ pending: 0 });

function start() {
  state.pending++;
}
function stop() {
  // evita numeri negativi se ci sono errori doppi
  state.pending = Math.max(0, state.pending - 1);
}

export const loading = {
  start,
  stop,
  isLoading: computed(() => state.pending > 0),
};
