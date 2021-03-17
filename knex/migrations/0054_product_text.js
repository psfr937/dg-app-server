exports.up = function(knex) {
  return knex.schema.createTable('inventory_text', function(table) {
    table.increments();
    table.integer('inventory_id').references('id').inTable('inventories');
    table.string('language');
    table.boolean('is_default');
    table.string('name');
    table.string('description')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('inventory_text')
};

