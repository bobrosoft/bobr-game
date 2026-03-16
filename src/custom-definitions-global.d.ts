export {};

declare global {
  // Fix for ERROR(TypeScript)  Cannot find name 'BinaryData'.
  type BinaryData = ArrayBuffer | SharedArrayBuffer | ArrayBufferView | DataView | Blob | Uint8Array;

  // Injected by Vite at build time
  const __APP_VERSION__: string;
}
