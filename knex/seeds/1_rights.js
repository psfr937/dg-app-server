const rights = require('../data/rights')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('rights').del()
    .then(function () {
      // Inserts seed entries
      return knex('rights').insert(rights);
    });
};
