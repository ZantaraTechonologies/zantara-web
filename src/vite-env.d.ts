/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WHATSAPP_SUPPORT_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
