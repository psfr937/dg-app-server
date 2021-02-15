exports.up = function(knex) {
  return knex.schema.table('requests', function(table) {
    table.integer('seller_id').references('id').inTable('users');
    table.string('picture_url')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('requests')
};

