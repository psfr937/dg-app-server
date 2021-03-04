exports.up = function(knex) {
  return knex.schema.dropTable('emails')
    .then(() => {
      return knex.schema.table('users', function(table){
        table.boolean('email_verified').defaultTo(false);
        table.timestamp('email_verified_at');
      })
    })
};

exports.down = function(knex) {
  return knex.schema.createTable('emails', function(table){
    table.increments();
    table.text('address').notNullable();
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('verified_at')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  }).then(() => {
      return knex.schema.table('users', function(table){
        table.dropColumn('email_verified');
        table.dropColumn('email_verified_at');
      })
    })
};
