export {};

declare module "vitest" {
  interface ProvidedContext {
    integrationDatabaseUrl: string;
  }
}
