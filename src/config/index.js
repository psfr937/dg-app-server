if(process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'test'
){
  module.exports = require('./default');
}
else{
  module.exports = require('./prod');
}
