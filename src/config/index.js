
switch(process.env.NODE_ENV ) {
  case("development"):
    module.exports = require('./default');
    break;
  case('test'):
    module.exports = require('./default');
    break;
  case('staging'):
    module.exports = require('./prod');
    break;
  case('production'):
    console.log('hi2');
    console.log(process.env.PUBLIC_PORT);
    console.log(process.env.NODE_HOST);
    module.exports = require('./prod');
    break;
  default:
    module.exports = require('./default');
    break;
}
