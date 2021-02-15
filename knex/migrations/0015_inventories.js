exports.up = function(knex) {
  return knex.schema.createTable('requests', function(table) {
    table.increments();
    table.string('name');
    table.integer('creator_id').references('id').inTable('users');
    table.integer('budget');
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('requests')
};
