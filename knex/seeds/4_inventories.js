const data = require('../data/inventories')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('inventories').del()
    .then(function () {
      // Inserts seed entries
      return knex('inventories').insert(data);
    });
};
