exports.up = function(knex) {
  return knex.schema.createTable('quotations', function(table) {
    table.increments();
    table.integer('user_id');
    table.integer('delivery_cost');
    table.float('from_lat');
    table.float('from_lng');
    table.string('from_phone');
    table.string('from_name');
    table.string('from_line_one');
    table.string('from_line_two');
    table.string('from_formatted');
    table.float('to_lat');
    table.float('to_lng');
    table.string('to_line_one');
    table.string('to_line_two');
    table.string('to_formatted');
    table.string('to_phone');
    table.string('to_name');
    table.string('delivery_type');
    table.integer('schedule_at');
    table.integer('weight');
    table.integer('height');
    table.integer('length');
    table.integer('width');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('quotations')
};

