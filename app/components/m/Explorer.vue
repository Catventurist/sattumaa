<script setup lang="ts">
import type { BreadcrumbItem, ContextMenuItem, TreeItem } from '@nuxt/ui'

type ExplorerItem = TreeItem & { id: string }

defineProps<{
  open?: boolean
  constraints?: HTMLElement | null
}>()

const emit = defineEmits<{
  minimize: []
  close: []
}>()

const { t } = useI18n()
const fs = useFileSystem()
const { load } = usePlayer()
const gallery = useGallery()
const { launch } = useWin()
const { appsFor, openWith } = useFileOpen()

const selected = ref('root')
const expanded = ref(['root'])
const renaming = ref<string | null>(null)
const draft = ref('')
const confirmEmpty = ref(false)

const current = computed(() => fs.nodes.value[selected.value] ? selected.value : 'root')
const inBin = computed(() => fs.inTrash(current.value))
const files = computed(() => fs.childrenOf(current.value))

function toTree(id: string): ExplorerItem {
  const node = fs.nodes.value[id]!
  return {
    id,
    label: fs.label(node),
    children: fs.childrenOf(id).filter(n => n.kind === 'folder').map(n => toTree(n.id))
  }
}

const tree = computed<ExplorerItem[]>(() => [toTree('root')])

function findItem(items: ExplorerItem[], id: string): ExplorerItem | undefined {
  for (const item of items) {
    if (item.id === id) return item
    const found = item.children && findItem(item.children as ExplorerItem[], id)
    if (found) return found
  }
}

const treeValue = computed({
  get: () => findItem(tree.value, current.value),
  set: (item?: ExplorerItem) => {
    if (item?.id) selected.value = item.id
  }
})

const crumbs = computed<BreadcrumbItem[]>(() => {
  const out: BreadcrumbItem[] = []
  let node: FsNode | undefined = fs.nodes.value[current.value]
  while (node) {
    const id = node.id
    out.unshift({ label: fs.label(node), onClick: () => (selected.value = id) })
    node = node.parent ? fs.nodes.value[node.parent] : undefined
  }
  return out
})

const icons: Record<FsNode['kind'], string> = {
  folder: 'i-lucide-folder',
  note: 'i-lucide-notebook-text',
  link: 'i-lucide-link',
  app: 'i-lucide-app-window',
  audio: 'i-lucide-music',
  video: 'i-lucide-film',
  image: 'i-lucide-image'
}

function iconFor(node: FsNode) {
  return node.id === TRASH_ID ? 'i-lucide-trash-2' : icons[node.kind]
}

function openNode(node: FsNode) {
  if (node.kind === 'folder') {
    selected.value = node.id
    return
  }

  if (inBin.value) return

  if (node.kind === 'image') {
    gallery.selected.value = node.id
    launch('pictures')
    return
  }

  if ((node.kind === 'audio' || node.kind === 'video') && node.src) {
    const tracks = fs.childrenOf(node.parent ?? 'root').filter(n => (n.kind === 'audio' || n.kind === 'video') && n.src)
    load(
      tracks.map(n => ({ id: n.id, src: n.src!, title: fs.label(n) })),
      tracks.findIndex(n => n.id === node.id)
    )
    launch('media')
    return
  }

  if (node.kind === 'note' || node.noteId) {
    openWith('notes', node)
    return
  }

  if (node.appId) launch(node.appId)
}

function startRename(node: FsNode) {
  renaming.value = node.id
  draft.value = fs.label(node)
}

function commitRename() {
  if (!renaming.value) return
  fs.rename(renaming.value, draft.value)
  renaming.value = null
}

function cancelRename() {
  renaming.value = null
}

function newFolder() {
  const id = fs.create(current.value, 'folder', { nameKey: 'explorer.newFolder' })
  const node = fs.nodes.value[id]
  if (node) startRename(node)
}

function newNote() {
  fs.create(current.value, 'note', { nameKey: 'explorer.newNote', appId: 'notes' })
}

function confirmEmptyTrash() {
  fs.emptyTrash()
  confirmEmpty.value = false
}

function openWithItems(node: FsNode): ContextMenuItem[] {
  const apps = appsFor(node).filter(app => app !== 'explorer')
  if (!apps.length) return []
  return [
    {
      label: t('explorer.openWith'),
      icon: 'i-lucide-app-window',
      children: apps.map(app => ({
        label: t(startApp(app).label),
        icon: startApp(app).icon,
        onSelect: () => openWith(app, node)
      }))
    }
  ]
}

function menuFor(node: FsNode): ContextMenuItem[] {
  if (inBin.value) {
    return [
      { label: t('explorer.restore'), icon: 'i-lucide-undo-2', onSelect: () => fs.restore(node.id) },
      { label: t('explorer.deleteForever'), icon: 'i-lucide-trash-2', color: 'error', onSelect: () => fs.deleteForever(node.id) }
    ]
  }

  if (node.id === TRASH_ID) {
    return [{ label: t('explorer.open'), icon: 'i-lucide-folder-open', onSelect: () => openNode(node) }]
  }

  return [
    { label: t('explorer.open'), icon: 'i-lucide-folder-open', onSelect: () => openNode(node) },
    ...openWithItems(node),
    { label: t('explorer.rename'), icon: 'i-lucide-pencil', onSelect: () => startRename(node) },
    { label: t('explorer.delete'), icon: 'i-lucide-trash-2', color: 'error', onSelect: () => fs.remove(node.id) }
  ]
}
</script>

<template>
  <MWindow
    :open="open"
    :title="t('explorer.title')"
    icon="i-lucide-folder-open"
    :constraints="constraints"
    size-class="h-[30rem] w-full max-w-3xl"
    @minimize="emit('minimize')"
    @close="emit('close')"
  >
    <div class="flex h-full min-h-0 flex-col">
      <UBreadcrumb
        :items="crumbs"
        class="border-b border-default px-2 py-1"
      />

      <div class="flex min-h-0 flex-1">
        <UTree
          v-model="treeValue"
          v-model:expanded="expanded"
          :items="tree"
          :get-key="i => (i as ExplorerItem).id"
          :aria-label="t('explorer.tree')"
          class="w-48 shrink-0 overflow-auto border-r border-default p-1"
        />

        <div class="flex min-w-0 flex-1 flex-col">
          <div class="flex items-center gap-1 border-b border-default px-2 py-1">
            <template v-if="!inBin">
              <UButton
                icon="i-lucide-folder-plus"
                color="neutral"
                variant="ghost"
                size="xs"
                :label="t('explorer.newFolder')"
                @click="newFolder"
              />
              <UButton
                icon="i-lucide-file-plus"
                color="neutral"
                variant="ghost"
                size="xs"
                :label="t('explorer.newNote')"
                @click="newNote"
              />
            </template>
            <UButton
              v-else
              icon="i-lucide-trash-2"
              color="error"
              variant="soft"
              size="xs"
              :label="t('explorer.emptyTrash')"
              :disabled="!files.length"
              @click="confirmEmpty = true"
            />
          </div>

          <div class="min-h-0 flex-1 overflow-auto p-2">
            <UEmpty
              v-if="!files.length"
              icon="i-lucide-folder"
              :title="inBin ? t('explorer.trashEmpty') : t('explorer.empty')"
            />
            <UContextMenu
              v-for="f in files"
              :key="f.id"
              :items="menuFor(f)"
            >
              <UInput
                v-if="renaming === f.id"
                v-model="draft"
                size="sm"
                :icon="iconFor(f)"
                autofocus
                class="w-full"
                @keydown.enter="commitRename"
                @keydown.esc="cancelRename"
                @blur="commitRename"
              />
              <UButton
                v-else
                variant="ghost"
                color="neutral"
                :icon="iconFor(f)"
                :label="fs.label(f)"
                class="w-full justify-start hover:bg-info/10"
                @dblclick="openNode(f)"
              />
            </UContextMenu>
          </div>

          <div class="border-t border-default px-2 py-1 text-xs text-muted">
            {{ t('explorer.items', { count: files.length }) }}
          </div>
        </div>
      </div>

      <UModal
        v-model:open="confirmEmpty"
        :title="t('explorer.emptyTitle')"
        :description="t('explorer.emptyConfirm')"
      >
        <template #footer="{ close }">
          <UButton
            color="neutral"
            variant="outline"
            :label="t('explorer.cancel')"
            @click="close"
          />
          <UButton
            color="error"
            :label="t('explorer.emptyTrash')"
            @click="confirmEmptyTrash"
          />
        </template>
      </UModal>
    </div>
  </MWindow>
</template>
