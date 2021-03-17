// const express = require('express')
// const path = require('path')
// const PORT = process.env.PORT || 5000
//
// express()
//   .use(express.static(path.join(__dirname, 'public')))
//   .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
//   .get('/', (req, res) => res.render('pages/index'))
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`))

import chalk from 'chalk';
import app from './app'
const path = require('path')
const port = process.env.PORT || 5000;
//const server 	= require('./socket/index')(app)

if (port) {
  app.get('/', (req, res) => {
    res.send("Hello World!");
  });

  app.listen(port, err => {

    if (err) console.error(chalk.red(`==> 😭  OMG!!! ${err}`));

    console.info(chalk.green(`==> 🌎  Listening at ${port}`))
  });
} else {
  console.error(
    chalk.red('==> 😭  OMG!!! No PORT environment variable has been specified')
  );
}



