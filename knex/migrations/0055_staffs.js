exports.up = function(knex) {
  return knex.schema.createTable('staffs', function(table) {
    table.increments();
    table.string('email');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('staffs')
};

