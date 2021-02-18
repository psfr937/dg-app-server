exports.up = function(knex) {
  return knex.schema.createTable('packlisttypes', function(table) {
    table.increments();
    table.string('name');
    table.integer('kg');
    table.string('dimension');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('packlisttypes')
};
