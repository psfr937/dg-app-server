exports.up = function(knex) {
  return knex.schema.table('plans', function(table) {
    table.float('price');
  })
};

exports.down = function(knex) {
  knex.schema.table('plans', function (table) {
    table.dropColumn('price');
  })
};
