exports.up = function(knex) {
  return knex.schema.createTable('tags', function(table) {
    table.increments();
    table.string('name');
    table.integer('aspect_id').references('id'
    ).inTable('aspects');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('tags')
};

