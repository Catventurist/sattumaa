import { useIntervalFn, useLocalStorage } from '@vueuse/core'

export interface Alarm {
  id: string
  time: string
  label: string
  enabled: boolean
}

export function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function formatMs(ms: number) {
  const total = Math.floor(ms / 10)
  return `${pad(Math.floor(total / 6000))}:${pad(Math.floor(total / 100) % 60)}.${pad(total % 100)}`
}

export function formatSeconds(s: number) {
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
}

export function useAlarms() {
  const alarms = useLocalStorage<Alarm[]>('win:clock:alarms', [], { initOnMounted: true })

  function add(time: string, label: string) {
    alarms.value = [...alarms.value, { id: crypto.randomUUID(), time, label, enabled: true }]
  }

  function remove(id: string) {
    alarms.value = alarms.value.filter(a => a.id !== id)
  }

  function setEnabled(id: string, enabled: boolean) {
    alarms.value = alarms.value.map(a => a.id === id ? { ...a, enabled } : a)
  }

  return { alarms, add, remove, setEnabled }
}

export function useAlarmWatcher() {
  const { t } = useI18n()
  const toast = useToast()
  const { alarms, setEnabled } = useAlarms()

  const { resume } = useIntervalFn(() => {
    const now = new Date()
    const stamp = `${pad(now.getHours())}:${pad(now.getMinutes())}`
    const due = alarms.value.filter(a => a.enabled && a.time === stamp)
    for (const alarm of due) {
      setEnabled(alarm.id, false)
      toast.add({
        title: alarm.label || t('clock.alarmRinging'),
        description: alarm.time,
        icon: 'i-lucide-alarm-clock',
        color: 'info',
        duration: 0
      })
    }
  }, 1000, { immediate: false })

  onMounted(resume)
}
