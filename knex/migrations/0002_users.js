
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('avatar_url');
    table.integer('age');
    table.text('name')
    table.string('phone').unique()
    table.string('email')
    table.string('hkid')
    table.string('referrer')
    table.string('password')
    table.text('address')
    table.integer('role_id').references('id').inTable('roles')
    table.specificType('gender', 'character')
    table.boolean('verified').defaultTo(false)
    table.timestamp('last_login_time')
    table.timestamp('registered_at')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
