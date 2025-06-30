// This file provides type definitions for Vite's `import.meta.env` feature.
// By augmenting the `ImportMetaEnv` interface, you can get type-safe access
// to your environment variables.

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // you can add more env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
