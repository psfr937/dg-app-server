exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.increments();
    table.integer('user_id').references('id').inTable('users')

  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('orders')
};

