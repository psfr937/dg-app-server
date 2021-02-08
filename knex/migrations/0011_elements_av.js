exports.up = function(knex) {
  return knex.schema.createTable('elements_av', function(table) {
    table.increments()
    table.integer('element_id').references('elements')
    table.integer('attribute_id').references('attributes')
    table.string('value')
    table.boolean('removed').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('elements_av')
};
