/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('users', (table) => {
            table.increments('id').primary(); // Auto-incrementing integer primary key
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.string('phone_number').notNullable().unique(); // Ensure unique phone numbers
            table.timestamps(true, true); // Adds created_at and updated_at columns
        })
        .createTable('medications', (table) => {
            table.increments('id').primary(); // Auto-incrementing integer primary key
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('medication_name').notNullable();
            table.time('reminder_time').notNullable(); // For daily reminders at a fixed time
            table.datetime('executed_datetime');    // To update last executed time
            table.timestamps(true, true); // Adds created_at and updated_at columns
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('medications')
        .dropTableIfExists('users');
};
