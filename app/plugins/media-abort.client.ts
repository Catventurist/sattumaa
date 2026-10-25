export default defineNuxtPlugin(() => {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    if (reason instanceof DOMException && reason.name === 'AbortError' && reason.message.includes('play()')) {
      event.preventDefault()
    }
  })
})
