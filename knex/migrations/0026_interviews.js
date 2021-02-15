exports.up = function(knex) {
  return knex.schema.table('interviews', function(table) {
      table.integer('request_id').references('id').inTable('requests');
      table.integer('payment_id').references('id').inTable('payments')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('interviews')
};
