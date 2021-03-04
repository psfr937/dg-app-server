exports.up = function(knex) {
  return knex.schema.createTable('inventory_tag', function(table) {
    table.increments();
    table.string('name');
    table.integer('inventory_id').references('id'
    ).inTable('inventories');
    table.integer('tag_id').references('id'
    ).inTable('tags');
    table.float('rating');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('inventory_tag')
};

