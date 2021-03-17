exports.up = function(knex) {
  return knex.schema.createTable('measurements', function(table) {
    table.increments();
    table.string('name');
    table.integer('physique_id').references('id').inTable('physiques');

  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('measurements')
};

