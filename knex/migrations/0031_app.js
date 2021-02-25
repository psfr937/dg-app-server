exports.up = function(knex) {
  return knex.schema.createTable('apps', function(table) {
    table.increments();
    table.string('key');
    table.string('name');
    table.float('lat');
    table.float('lng');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('apps')
};
