exports.up = function(knex) {
  return knex.schema.createTable('addresses', function(table) {
    table.increments();
    table.integer('user_id').references('id').inTable('users');
    table.string('line_one');
    table.string('line_two');
    table.string('city');
    table.string('province');
    table.integer('zip');
    table.string('country');
  }).then(() => {
    return knex.schema.createTable('default_address',function(table) {
      table.increments();
      table.integer('address_id').references('id').inTable('addresses');
      table.integer('user_id').references('id').inTable('users');
    })
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('default_address').then(() => {
    return knex.schema.dropTable('addresses')
  })
};
