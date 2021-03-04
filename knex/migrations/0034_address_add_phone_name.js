exports.up = function(knex) {
  return knex.schema.table('addresses', function(table) {
    table.string('recipient_phone');
    table.string('recipient_name');
  })
};

exports.down = function(knex) {
  return knex.schema.table('addresses', function(table) {
    table.dropColumn('recipient_phone');
    table.dropColumn('recipient_name');
  })
};

