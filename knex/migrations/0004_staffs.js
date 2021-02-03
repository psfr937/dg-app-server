exports.up = function(knex) {
  return knex.schema.createTable('staffs', function(table) {
    table.increments();
    table.integer('user_id').unique().references('id').inTable('users')
    table.boolean('removed').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('staffs')
};
