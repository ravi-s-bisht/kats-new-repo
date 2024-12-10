/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("Facility", (table) => {
        table.increments("id").primary();
        table.string("name", 255).notNullable();
    });

    await knex.schema.createTable("Branch", (table) => {
        table.increments("id").primary();
        table.string("location", 255);
        table
            .integer("facility_id")
            .unsigned()
            .references("id")
            .inTable("Facility")
            .onDelete("CASCADE");
    });

    await knex.schema.createTable("Users", (table) => {
        table.increments("id").primary();
        table.string("first_name", 255);
        table.string("last_name", 255);
        table.string("phone_number", 255).notNullable();
        table.string("email", 255).notNullable();
        table.enu("role", ["admin", "facility", "user"]).notNullable();
        table
            .integer("branch_id")
            .unsigned()
            .references("id")
            .inTable("Branch")
            .onDelete("CASCADE");
    });

    await knex.schema.createTable("Medication", (table) => {
        table.increments("id").primary();
        table.string("medication_name", 255).notNullable();
        table.time("reminder_time");
        table.datetime("executed_datetime");
        table
            .integer("user_id")
            .unsigned()
            .references("id")
            .inTable("Users")
            .onDelete("CASCADE");
    });

    await knex.schema.createTable("ReminderHistory", (table) => {
        table.increments("id").primary();
        table
            .integer("medication_id")
            .unsigned()
            .references("id")
            .inTable("Medication")
            .onDelete("CASCADE");
        table.datetime("reminder_time").notNullable();
    });

    await knex.schema.createTable("Avatar", (table) => {
        table.increments("id").primary();
        table.string("name", 255).notNullable();
        table.string("imageUrl", 255).notNullable();
        table.enu("type", ["voice", "video"]).notNullable();
    });

    await knex.schema.createTable("SessionLog", (table) => {
        table.increments("id").primary();
        table.enu("type", ["voice", "video"]).notNullable();
        table
            .integer("user_id")
            .unsigned()
            .references("id")
            .inTable("Users")
            .onDelete("SET NULL");
        table
            .integer("avatar_id")
            .unsigned()
            .references("id")
            .inTable("Avatar")
            .onDelete("SET NULL");
        table.datetime("start_time").notNullable();
        table.datetime("end_time").notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("SessionLog");
    await knex.schema.dropTableIfExists("Avatar");
    await knex.schema.dropTableIfExists("ReminderHistory");
    await knex.schema.dropTableIfExists("Medication");
    await knex.schema.dropTableIfExists("Users");
    await knex.schema.dropTableIfExists("Branch");
    await knex.schema.dropTableIfExists("Facility");
};
