const Knex = require("knex");

const db = Knex({
    client: "mysql2",
    connection: {
        host: process.env.MYSQL_HOST,
        port: 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB_SENIOR,
        ssl: {
            rejectUnauthorized: true
        }
    },
});

export default db;
