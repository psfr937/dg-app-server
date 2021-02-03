exports.up = function(knex) {
  return knex.schema.createTable('visits', function(table) {
    table.increments()
    table.string('title')
    table.integer('client_id').references('id').inTable('clients')
    table.integer('staff_id').references('id').inTable('staffs')
    table.text('main_description')
    table.text('evidence')
    table.text('history')
    table.timestamp('sick_leave_start')
    table.timestamp('sick_leave_end')
    table.timestamp('visit_time')
    table.integer('duration')
    table.boolean('removed').defaultTo(false)
    table.boolean('is_web_booked')
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('visits')
};
