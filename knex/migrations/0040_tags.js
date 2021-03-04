exports.up = function(knex) {
  return knex.schema.createTable('tags', function(table) {
    table.increments();
    table.string('name');
    table.integer('category_id').references('id'
    ).inTable('tag_category');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('tags')
};

