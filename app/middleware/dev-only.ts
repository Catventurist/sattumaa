export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.dev) {
    const { $i18n } = useNuxtApp()
    return abortNavigation(createError({
      status: 404,
      statusText: $i18n.t('error.notFoundTitle')
    }))
  }
})
