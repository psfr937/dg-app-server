exports.up = function(knex) {
  return knex.schema.createTable('default_pm', function(table) {
    table.increments();
    table.integer('user_id').unique().references('id').inTable('users');
    table.integer('default_pm_id').references('id').inTable('pms')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('default_pm')
};
