exports.up = function(knex) {
  return knex.schema.table('payments', function(table) {
    table.integer('pm_id').references('id').inTable('pms');
    table.integer('amount');
    table.string('currency');
  })
};

exports.down = function(knex) {
  return knex.schema.table('payments', function(table) {
    table.dropColumn('pm_id');
    table.dropColumn('amount');
    table.dropColumn('currency');
  })
};

