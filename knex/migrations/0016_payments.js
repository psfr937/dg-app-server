exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.increments();
    table.string('stripe_id')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('payments')
};
