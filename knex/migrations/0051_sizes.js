exports.up = function(knex) {
  return knex.schema.createTable('sizes', function(table) {
    table.increments();
    table.string('name');
    table.integer('measurement_id').references('id').inTable('measurements');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('sizes')
};

