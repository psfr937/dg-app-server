exports.up = function(knex) {
  return knex.schema.createTable('images', function(table) {
    table.increments();
    table.string('url');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('images')
};

