

if (process.env.NODE_ENV === "development") {
  console.log('hi1');
  module.exports = require('./default');
} else {
  console.log('hi2');
  console.log(process.env.PUBLIC_PORT);
  console.log(process.env.NODE_HOST);
  module.exports = require('./prod');
}
