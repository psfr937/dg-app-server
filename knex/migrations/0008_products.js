exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.increments()
    table.text('name')
    table.integer('price')
    table.boolean('removed').defaultTo(false)
    table.text('picture_url')
    table.text('description')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('products')
};
