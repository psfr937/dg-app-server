exports.up = function(knex) {
  return knex.schema.table('apps', function(table) {
    table.string('line_one');
    table.string('line_two');
    table.string('city');
    table.string('province');
    table.integer('zip');
    table.string('country');
    table.string('recipient_name');
    table.string('recipient_phone');
  })
};

exports.down = function(knex) {
  return knex.schema.table('apps', function(table){
    table.dropColumn('line_one');
    table.dropColumn('line_two');
    table.dropColumn('city');
    table.dropColumn('province');
    table.dropColumn('zip');
    table.dropColumn('country');
    table.dropColumn('recipient_name');
    table.dropColumn('recipient_phone');
  })
  
};
