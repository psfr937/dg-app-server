
const table = 'physiques';
const data = require(`../data/${table}`);
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex(table).del()
    .then(function () {
      // Inserts seed entries
      return knex(table).insert(data);
    })
    .then(function (){
      return knex.raw(`ALTER SEQUENCE ${table}_id_seq RESTART WITH ${data.length + 1}`)
    })
};