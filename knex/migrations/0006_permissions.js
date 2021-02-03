exports.up = function(knex) {
  return knex.schema.createTable('permissions', function(table) {
    table.increments();
    table.integer('role_id').references('id').inTable('roles')
    table.integer('right_id').references('id').inTable('rights')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('permissions')
};
