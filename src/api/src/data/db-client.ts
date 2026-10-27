import pg from "pg";

// Pool : se reconnecte si PostgreSQL redémarre
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Sans écouteur, une connexion coupée fait planter Node
pool.on("error", (error) => {
  console.error("Connexion PostgreSQL perdue :", error.message);
});
