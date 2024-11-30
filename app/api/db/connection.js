import knexfile from "./knexfile";

const Knex = require("knex");

const db = Knex(knexfile.development);

export default db;
