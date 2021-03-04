exports.up = function(knex) {
  return knex.schema.table('addresses', function(table) {
    table.float('lat', 14, 10).alter();
    table.float('lng', 14, 10).alter();
  }).then(() => {
    return knex.schema.table('apps', function (table) {
      table.float('lat', 14, 10).alter();
      table.float('lng', 14, 10).alter();
    })
  })
};

exports.down = function(knex) {
  return knex.schema.table('addresses', function(table) {
    table.float('lat', 14, 10).alter();
    table.float('lng', 14, 10).alter();
  }).then(() => {
    return knex.schema.table('apps', function (table) {
      table.float('lat', 14, 10).alter();
      table.float('lng', 14, 10).alter();
    })
  })
};

