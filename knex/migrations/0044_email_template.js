exports.up = function(knex) {
  return knex.schema.createTable('email_templates', function(table) {
    table.increments();
    table.string('key').unique();
    table.string('from_email');
    table.string('sendgrid_template_id').unique();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('email_templates')
};

