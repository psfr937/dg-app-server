exports.up = function(knex) {
  return knex.schema.table('pms', function(table) {
    table.unique('stripe_id');
    table.string('country');
    table.string('brand');
  })
};

exports.down = function(knex) {
  return knex.schema.table('pms', function(table) {
    table.dropUnique('stripe_id');
    table.dropColumn('country');
    table.dropColumn('brand');
  })
};
