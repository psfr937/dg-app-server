exports.up = function(knex) {
  return knex.schema.createTable('inventory_order', function(table) {
    table.increments();
    table.integer('inventory_id').references('id').inTable('inventories');
    table.integer('order_id').references('id').inTable('orders');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('inventory_order');
};

