exports.up = function(knex) {
  return knex.schema.createTable('services', function(table) {
    table.increments();
    table.text('name')
    table.string('picture_url');
    table.integer('minutes_required')
    table.text('description')
    table.float('price')
    table.boolean('removed').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('services')
};
