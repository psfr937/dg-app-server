exports.up = function(knex) {
  return knex.schema.createTable('plans', function(table) {
    table.increments();
    table.string('name');
    table.string('stripe_id');
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('plans')
};
