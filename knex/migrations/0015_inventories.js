exports.up = function(knex) {
  return knex.schema.createTable('inventories', function(table) {
    table.increments();
    table.string('name');
    table.string('brand');
    table.specificType('gender', 'character')
    table.integer('size');
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('inventories')
};
