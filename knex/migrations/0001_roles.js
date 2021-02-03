exports.up = function(knex) {
  return knex.schema.createTable('roles', function(table) {
    table.integer('id').primary()
    table.string('title')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('roles')
};
