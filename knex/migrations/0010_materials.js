exports.up = function(knex) {
  return knex.schema.createTable('materials', function(table) {
    table.increments()
    table.text('name')
    table.integer('price')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('materials')
};
