exports.up = function(knex) {
  return knex.schema.createTable('web_items', function(table) {
    table.increments()
    table.text('picture_url')
    table.string('title')
    table.text('brief')
    table.integer('section_id').references('id').inTable('web_sections')
    table.integer('ranking')
    table.boolean('removed').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('web_items')
};
