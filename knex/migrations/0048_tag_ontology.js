exports.up = function(knex) {
  return knex.schema.createTable('tag_ontology', function(table) {
    table.increments();
    table.integer('ancestor_id').references('id').inTable('tags');
    table.integer('descendent_id').references('id').inTable('tags');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('tag_ontology')
};

