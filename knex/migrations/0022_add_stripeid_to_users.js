exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('stripe_id');
  })
};

exports.down = function(knex) {
  knex.schema.table('users', function (table) {
    table.dropColumn('stripe_id');
  })
};
