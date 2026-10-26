export interface Lesson {
  id: string
  icon: string
}

export interface Course {
  slug: string
  icon: string
  lessons: [Lesson, ...Lesson[]]
}

export function useCourses() {
  const courses: Course[] = [
    {
      slug: 'web',
      icon: 'i-lucide-globe',
      lessons: [
        { id: 'intro', icon: 'i-lucide-play-circle' },
        { id: 'components', icon: 'i-lucide-blocks' },
        { id: 'routing', icon: 'i-lucide-route' }
      ]
    },
    {
      slug: 'design',
      icon: 'i-lucide-palette',
      lessons: [
        { id: 'layout', icon: 'i-lucide-layout-grid' },
        { id: 'color', icon: 'i-lucide-pipette' },
        { id: 'typography', icon: 'i-lucide-type' }
      ]
    },
    {
      slug: 'data',
      icon: 'i-lucide-database',
      lessons: [
        { id: 'tables', icon: 'i-lucide-table' },
        { id: 'queries', icon: 'i-lucide-search-code' },
        { id: 'relations', icon: 'i-lucide-network' }
      ]
    }
  ]

  function findCourse(slug: string) {
    return courses.find(course => course.slug === slug)
  }

  return { courses, findCourse }
}

export function useProgress() {
  const completed = useState<Record<string, string[]>>('learning-progress', () => ({}))

  function isDone(slug: string, lessonId: string) {
    return completed.value[slug]?.includes(lessonId) ?? false
  }

  function toggle(slug: string, lessonId: string) {
    const list = completed.value[slug] ?? []
    completed.value = {
      ...completed.value,
      [slug]: list.includes(lessonId) ? list.filter(id => id !== lessonId) : [...list, lessonId]
    }
  }

  function doneCount(course: Course) {
    return course.lessons.filter(lesson => isDone(course.slug, lesson.id)).length
  }

  function percent(course: Course) {
    return Math.round(doneCount(course) / course.lessons.length * 100)
  }

  function nextLesson(course: Course) {
    return course.lessons.find(lesson => !isDone(course.slug, lesson.id)) ?? course.lessons[0]
  }

  function reset() {
    completed.value = {}
  }

  return { isDone, toggle, doneCount, percent, nextLesson, reset }
}

interface BackupData {
  version: number
  progress: Record<string, string[]>
  notes: Record<string, string>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function useBackup() {
  const { courses } = useCourses()
  const progress = useState<Record<string, string[]>>('learning-progress', () => ({}))
  const notes = useState<Record<string, string>>('learning-notes', () => ({}))

  const validNoteKeys = new Set(courses.flatMap(course => course.lessons.map(lesson => `${course.slug}:${lesson.id}`)))

  function exportBackup() {
    const data: BackupData = {
      version: 1,
      progress: progress.value,
      notes: notes.value
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `learning-progress-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importBackup(file: File) {
    if (file.size > 1_000_000) {
      return false
    }

    try {
      const data: unknown = JSON.parse(await file.text())

      if (!isRecord(data) || !isRecord(data.progress) || !isRecord(data.notes)) {
        return false
      }

      const savedProgress = data.progress
      const savedNotes = data.notes

      progress.value = Object.fromEntries(courses.flatMap((course) => {
        const list = savedProgress[course.slug]
        if (!Array.isArray(list)) {
          return []
        }
        return [[course.slug, course.lessons.map(lesson => lesson.id).filter(id => list.includes(id))]]
      }))

      notes.value = Object.fromEntries(
        Object.entries(savedNotes).filter((entry): entry is [string, string] => validNoteKeys.has(entry[0]) && typeof entry[1] === 'string')
      )

      return true
    } catch {
      return false
    }
  }

  return { exportBackup, importBackup }
}
