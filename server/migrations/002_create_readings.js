/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create enum type
  await knex.raw(`
    CREATE TYPE reading_slot AS ENUM (
      'MORNING_FASTING',
      'AFTER_BREAKFAST',
      'AFTER_LUNCH',
      'AFTER_DINNER'
    );
  `);

  await knex.schema.createTable('readings', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.date('reading_date').notNullable();
    table.specificType('slot', 'reading_slot').notNullable();
    table.smallint('value_mgdl').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(['user_id', 'reading_date', 'slot'], { indexName: 'readings_user_date_slot_uq' });
    table.index(['user_id', 'reading_date'], 'readings_user_date_idx');
  });

  // Check constraint for 40-600 range
  await knex.raw('ALTER TABLE readings ADD CONSTRAINT readings_value_mgdl_check CHECK (value_mgdl BETWEEN 40 AND 600)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('readings');
  await knex.raw('DROP TYPE IF EXISTS reading_slot');
};
