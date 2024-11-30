/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.string("token");
    })
    .createTable("admins", (table) => {
      table.increments("id").primary();
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("email").notNullable().unique();
      table.string("token");
      table.integer("branch_id").unsigned().references("id").inTable("branch");
    })
    .createTable("branch", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("location").notNullable();
      table
        .integer("facility_id")
        .unsigned()
        .references("id")
        .inTable("facility");
    })
    .createTable("facility", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("admins")
    .dropTableIfExists("branch")
    .dropTableIfExists("facility")
    .table("users", (table) => {
      table.dropColumn("token");
    })
    .dropTableIfExists("medications")
    .dropTableIfExists("users");
};
