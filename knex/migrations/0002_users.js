
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('facebook_agent_id');
    table.string('avatar_url');
    table.integer('age');
    table.string('email');
    table.string('password')
    table.string('family_name')
    table.string('middle_name')
    table.string('given_name')
    table.string('display_name')
    table.specificType('gender', 'character')
    table.string('verify_email_nonce')
    table.string('reset_email_nonce')
    table.timestamp('last_login_time')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
