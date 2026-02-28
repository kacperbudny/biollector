// TODO: figure out a way to make it not needed
// Provide required env for modules that load config (e.g. db) when tests import services
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/test";
