import pg from 'pg';

// process permet d'aller chercher la variable DB_URL dans le fichier ".env"
export const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

