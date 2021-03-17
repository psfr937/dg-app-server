exports.up = function(knex) {
  return knex.schema.createTable('image_inventory', function(table) {
    table.increments();
    table.integer('image_id').references('id').inTable('images');
    table.integer('inventory_id').references('id').inTable('inventories');
    table.integer('order');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('image_inventory')
};

