exports.up = function(knex) {
  return knex.schema.table('inventories', function(table) {
    table.boolean('sold').defaultTo(false);
  })
};

exports.down = function(knex) {
  return knex.schema.table('inventories', function(table) {
    return table.dropColumn('sold')
  })
};

