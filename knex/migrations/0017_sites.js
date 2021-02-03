exports.up = function(knex) {
  return knex.schema.createTable('sites', function(table) {
    table.increments()
    table.text('phone_number')
    table.text('company_name')
    table.text('email')
    table.text('logo_url')
    table.text('banner_url')
    table.text('address')
    table.boolean('removed').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('web_items')
};
