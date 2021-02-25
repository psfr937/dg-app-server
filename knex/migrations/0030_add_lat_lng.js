exports.up = function(knex) {
  return knex.schema.table('addresses', function(table) {
    table.float('lat');
    table.float('lng')
    table.text('formatted')
  })
};

exports.down = function(knex) {
  return knex.schema.table('addresses', function(table) {
    table.dropColumn('lat');
    table.dropColumn('lng')
    table.dropColumn('formatted')
  })
};
