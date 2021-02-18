exports.up = function(knex) {
  return knex.schema.table('inventories', function(table) {
    table.float('price')
  })
};

exports.down = function(knex) {
  knex.schema.table('inventories', function (table) {
    table.dropColumn('price');
  })
};
