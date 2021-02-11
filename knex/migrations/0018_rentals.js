exports.up = function(knex) {
  return knex.schema.createTable('rentals', function(table) {
    table.increments();
    table.string('name')
    table.integer('user_id').references('id').inTable('users')
    table.integer('inventory_id').references('id').inTable('inventories')
    table.timestamp('rent_time').defaultTo(knex.fn.now());
    table.timestamp('return_time').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('rentals')
};
