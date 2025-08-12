import { reactive } from 'vue'

const state = reactive({ open: false, reloading: false })
let _update: (() => Promise<void>) | null = null

// verrà ridefinito dal registerSW, ma qui basta esporre API
export function bindUpdater(updateSW: () => Promise<void>) {
  _update = updateSW
}

export const showUpdateBanner = {
  open() { state.open = true },
  close() { state.open = false },
  get state() { return state },
  async updateNow() {
    if (!_update) return (state.open = false)
    state.reloading = true
    await _update()
    // forziamo un reload per caricare la nuova versione
    window.location.reload()
  }
}
