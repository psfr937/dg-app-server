exports.up = function(knex) {
  return knex.schema.createTable('elements', function(table) {
    table.increments()
    table.text('name')
    table.boolean('removed').defaultTo(false)
    table.integer('eletype_id').references('id').inTable('eletypes')
    table.text('description')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('elements')
};
