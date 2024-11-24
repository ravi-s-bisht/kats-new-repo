const Knex = require('knex')

const db = Knex({
    client: "mysql2",
    connection: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB_DEMO,
        ssl: {
            rejectUnauthorized: true // Defaults to true, enforces secure connection
        },
    },
})

export default db;