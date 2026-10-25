export type color = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' | undefined

declare global {
  interface FilePickerAcceptType {
    description?: string
    accept: Record<string, string[]>
  }

  interface FilePickerOptions {
    types?: FilePickerAcceptType[]
    excludeAcceptAllOption?: boolean
  }

  interface OpenFilePickerOptions extends FilePickerOptions {
    multiple?: boolean
  }

  interface SaveFilePickerOptions extends FilePickerOptions {
    suggestedName?: string
  }

  interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite'
  }

  interface FileSystemFileHandle {
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
  }

  interface Window {
    showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>
    showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>
  }
}
