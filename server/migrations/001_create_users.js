/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 255).notNullable();
    table.string('password_hash', 100).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Create case-insensitive unique index on LOWER(email)
  await knex.raw('CREATE UNIQUE INDEX users_email_lower_uidx ON users (LOWER(email))');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw('DROP INDEX IF EXISTS users_email_lower_uidx');
  await knex.schema.dropTableIfExists('users');
};
