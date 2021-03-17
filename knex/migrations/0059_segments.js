exports.up = function(knex) {
  return knex.schema.createTable('segments', function(table) {
    table.increments();
    table.string('name')
  }).then(()=> {
    return knex.schema.table('physiques', function(table) {
      table.integer('segment_id').references('id').inTable('segments')
    })
  })
};

exports.down = function(knex) {
  return knex.schema.table('physiques', function(table) {
    table.dropColumn('segment_id')
}).then(() => {
    return knex.schema.dropTable('segments')
  });
};

