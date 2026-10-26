export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10), // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
  dbUrl: process.env.DATABASE_URL ?? "postgresql://postgres:randompassword@localhost:5432/oquiz",
  allowedOrigins: process.env.ALLOWED_ORIGINS ?? "*",
};
