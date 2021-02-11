exports.up = function(knex) {
  return knex.schema.createTable('screens', function(table) {
    table.increments()
    table.text('name')
    table.boolean('removed').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('screens')
};
