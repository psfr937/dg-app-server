exports.up = function(knex) {
  return knex.schema.createTable('tag_text', function(table) {
    table.increments();
    table.integer('tag_id').references('id').inTable('tags');
    table.string('language');
    table.boolean('is_default');
    table.string('name');
    table.string('description');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('tag_text')
};