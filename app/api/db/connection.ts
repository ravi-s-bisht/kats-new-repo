import Knex from "knex"

const knex = Knex({
  client: "mysql",
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : undefined,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    ssl: true,
  },
})

module.exports = { knex }