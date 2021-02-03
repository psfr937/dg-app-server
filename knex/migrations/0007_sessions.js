
exports.up = function(knex) {
  return knex.schema.createTable('sessions', function(table) {
    table.increments();
    table.string('session_id').notNullable();
    table.integer('user_id').references('id').inTable('users');
    table.timestamp('created_at');
    table.timestamp('login_time')
    table.text('refresh_token')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('sessions')
};
