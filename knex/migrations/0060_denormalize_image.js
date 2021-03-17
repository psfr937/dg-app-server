
exports.up = function(knex) {

    return knex.schema.table('image_inventory', function (table) {
      table.string('url');
      table.dropColumn('image_id');
      table.renameColumn('order', 'item_order');
    }).then(() => {
      return knex.schema.dropTable('images')
    })
};

exports.down = function(knex) {
  return knex.schema.createTable('images', function(table) {
    table.increments();
    table.string('url');
  }).then(() => {
    return knex.schema.table('image_inventory', function (table) {
      table.dropColumn('url');
      table.integer('image_id').references('id').inTable('images');
      table.renameColumn('item_order', 'order');
    })
  })
};

