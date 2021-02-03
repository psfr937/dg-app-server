exports.up = function(knex) {
  return knex.schema.createTable('service_visit', function(table) {
    table.increments()
    table.text('name')
    table.integer('visit_id').references('id').inTable('visits');
    table.integer('service_id').references('id').inTable('services');
    table.boolean('removed').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('service_visit')
};
