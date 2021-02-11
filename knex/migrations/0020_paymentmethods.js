exports.up = function(knex) {
  return knex.schema.createTable('pms', function(table) {
    table.increments();
    table.string('stripe_id')
    table.integer('user_id').references('id').inTable('users');
    table.string('funding');
    table.string('fingerprint');
    table.string('last_four');
    table.integer('exp_month');
    table.integer('exp_year');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('pms')
};
