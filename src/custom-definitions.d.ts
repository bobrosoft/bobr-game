// Custom type definitions for TXT files to be imported as raw strings
declare module '*.txt?raw' {
  const content: string;
  export default content;
}
