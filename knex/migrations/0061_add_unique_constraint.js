exports.up = function(knex) {
  return knex.schema.table('inventory_order', function(table) {
    table.unique(['inventory_id', 'order_id'])
  }).then(() => {
    return knex.schema.table('inventory_tag', function (table) {
      table.unique(['inventory_id', 'tag_id'])
    })
  }).then(() => {
      return knex.schema.table('inventory_text', function (table) {
        table.unique(['inventory_id', 'language'])
      })
    }).then(() => {
        return knex.schema.table('image_inventory', function (table) {
          table.unique(['inventory_id', 'item_order'])
        })
    })
};

exports.down = function(knex) {
  return knex.schema.table('inventory_order', function(table) {
    table.dropUnique(['inventory_id', 'order_id'])
  }).then(() => {
    return knex.schema.table('inventory_tag', function (table) {
      table.dropUnique(['inventory_id', 'tag_id'])
    })
  }).then(() => {
    return knex.schema.table('inventory_text', function (table) {
      table.dropUnique(['inventory_id', 'language'])
    })
  }).then(() => {
    return knex.schema.table('image_inventory', function (table) {
      table.dropUnique(['inventory_id', 'item_order'])
    })
  })
};

