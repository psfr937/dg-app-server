exports.up = function(knex) {
  return knex.schema.createTable('rights', function(table) {
    table.integer('id').primary()
    table.string('action')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('rights')
};
