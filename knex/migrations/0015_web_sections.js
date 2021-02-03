exports.up = function(knex) {
  return knex.schema.createTable('web_sections', function(table) {
    table.increments()
    table.string('title')
    table.integer('layout_id')
    table.text('picture_url')
    table.integer('ranking')
    table.boolean('removed').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('web_sections')
};
