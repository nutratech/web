// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
    interface BlogPost {
      title: string;
      date: string;
      description?: string;
      author?: string;
    }
  }

  const __COMMIT_HASH__: string;
  const __BUILD_TIMESTAMP__: string;
  const __SERVICES_COUNT__: number;
}

export {};
