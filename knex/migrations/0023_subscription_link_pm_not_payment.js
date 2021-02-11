exports.up = function(knex) {
  return knex.schema.table('subscriptions', function(table) {
    table.integer('pm_id').references('id').inTable('pms');
    table.dropColumn('payment_id');
  })
};

exports.down = function(knex) {
  return knex.schema.table('subscriptions', function (table) {
    table.dropColumn('pm_id');
    table.integer('payment_id').references('id').inTable('payments');

  })
};
