/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
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
    await knex.schema.alterTable("SessionLog", (table) => {
        table.datetime("start_time").notNullable().alter();
        table.datetime("end_time").notNullable().alter();
    });
};
