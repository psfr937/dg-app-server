exports.up = function(knex) {
  return knex.schema.createTable('subscriptions', function(table) {
    table.increments();
    table.string('stripe_id')
    table.integer('user_id').references('id').inTable('users');
    table.integer('plan_id').references('id').inTable('plans');
    table.integer('payment_id').references('id').inTable('payments');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('subscriptions')
};
