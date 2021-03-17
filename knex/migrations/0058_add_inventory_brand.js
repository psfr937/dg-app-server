exports.up = function(knex) {
  return knex.schema.table('inventories', function(table) {
    table.integer('brand_id').references('id').inTable('tags');
  })
};

exports.down = function(knex) {
  return knex.schema.table('inventories', function(table) {
    return table.dropColumn('brand_id')
  })
};

