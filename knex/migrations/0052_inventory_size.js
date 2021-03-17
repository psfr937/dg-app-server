exports.up = function(knex) {
  return knex.schema.createTable('inventory_size', function(table) {
    table.increments();
    table.integer('inventory_id').references('id').inTable('inventories');
    table.integer('size_id').references('id').inTable('sizes');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('inventory_size')
};

