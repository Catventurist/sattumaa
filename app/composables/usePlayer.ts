export interface PlayerTrack {
  id: string
  src: string
  title: string
}

export function usePlayer() {
  const queue = useState<PlayerTrack[]>('player:queue', () => [])
  const index = useState<number>('player:index', () => 0)

  const current = computed(() => queue.value[index.value])
  const hasNext = computed(() => index.value < queue.value.length - 1)
  const hasPrevious = computed(() => index.value > 0)

  function load(tracks: PlayerTrack[], start = 0) {
    queue.value = tracks
    index.value = Math.max(start, 0)
  }

  function select(i: number) {
    if (queue.value[i]) index.value = i
  }

  function next() {
    if (hasNext.value) index.value++
  }

  function previous() {
    if (hasPrevious.value) index.value--
  }

  function playSrc(track: PlayerTrack) {
    const changed = current.value?.src !== track.src
    let found = queue.value.findIndex(item => item.src === track.src)
    if (found === -1) {
      queue.value = [...queue.value, track]
      found = queue.value.length - 1
    }
    index.value = found
    return changed
  }

  return { queue, index, current, hasNext, hasPrevious, load, select, next, previous, playSrc }
}
