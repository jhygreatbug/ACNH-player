interface Window {
  config: {
    audioBasePath: string
  }
  checkFiles: (path: string) => Promise<string>
  saveAudioBasePath: (path: string) => void
}
