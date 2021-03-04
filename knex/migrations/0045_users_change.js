exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('family_name');
    table.dropColumn('given_name');
    table.dropColumn('middle_name');
    table.renameColumn('reset_email_nonce', 'reset_password_nonce');
    table.renameColumn('display_name', 'name');
  })
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('family_name');
    table.string('given_name');
    table.string('middle_name');
    table.renameColumn('reset_password_nonce', 'reset_email_nonce');
    table.renameColumn('name', 'display_name');
  })
};
