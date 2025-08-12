import { ref, onMounted, onBeforeUnmount } from 'vue'

const deferred = ref<any>(null)
export const canInstall = ref(false)

export function useA2HS() {
  function onBeforeInstallPrompt(e: any) {
    e.preventDefault()
    deferred.value = e
    canInstall.value = true
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  })

  async function showPrompt() {
    if (!deferred.value) return
    const e = deferred.value
    deferred.value = null
    const { outcome } = await e.prompt()
    canInstall.value = false
    return outcome  // 'accepted' | 'dismissed'
  }

  return { canInstall, showPrompt }
}
