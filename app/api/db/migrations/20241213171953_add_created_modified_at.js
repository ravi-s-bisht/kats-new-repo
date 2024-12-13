/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const tables = [
        "Medications",
        "ReminderHistory",
        "Avatar",
        "SessionLog",
    ];

    for (const tableName of tables) {
        await knex.schema.alterTable(tableName, (table) => {
            table.datetime("created_at").defaultTo(knex.fn.now());
            table.datetime("modified_at").defaultTo(knex.fn.now());
        });
    }

    // Modify `SessionLog` to make `start_time` and `end_time` nullable
    await knex.schema.alterTable("SessionLog", (table) => {
        table.datetime("start_time").nullable().alter();
        table.datetime("end_time").nullable().alter();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    const tables = [
        "Medications",
        "ReminderHistory",
        "Avatar",
        "SessionLog",
    ];

    for (const tableName of tables) {
        await knex.schema.alterTable(tableName, (table) => {
            table.dropColumn("created_at");
            table.dropColumn("modified_at");
        });
    }

    // Revert `SessionLog` to make `start_time` and `end_time` non-nullable
    await knex.schema.alterTable("SessionLog", (table) => {
        table.datetime("start_time").notNullable().alter();
        table.datetime("end_time").notNullable().alter();
    });
};