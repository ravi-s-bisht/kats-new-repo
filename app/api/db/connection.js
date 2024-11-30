const Knex = require("knex");

const db = Knex({
    client: "mysql",
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'demo_db',
        ssl: false,
    },
});

export default db;
