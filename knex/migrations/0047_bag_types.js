exports.up = function(knex) {
  return knex.schema.createTable('bag_types', function(table) {
    table.increments();
    table.string('name');
    table.string('picture_url');
    table.integer('height');
    table.integer('width');
    table.integer('length');
    table.integer('weight');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('bag_types')
};

