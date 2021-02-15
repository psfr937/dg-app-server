exports.up = function(knex) {
  return knex.schema.table('inventories', function(table) {
    table.integer('seller_id').references('id').inTable('users');
    table.string('picture_url')
  })
};

exports.down = function(knex) {
  knex.schema.table('inventories', function (table) {
    table.dropColumn('seller_id');
    table.dropColumn('picture_url')
  })
};
