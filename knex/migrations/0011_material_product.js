exports.up = function(knex) {
  return knex.schema.createTable('material_product', function(table) {
    table.increments();
    table.integer('material_id').references('id').inTable('materials');
    table.integer('product_id').references('id').inTable('products')
    table.integer('amount');
    table.integer('dislikes');
    table.text('content')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('material_product')
};
