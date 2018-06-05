'use strict';

const config = require('config');
const Hapi = require('hapi');
const registerPlugins = require('./plugins');

const init = async () => {
  const server = Hapi.server({
    port: config.get('server').port
  });

  await registerPlugins(server);
  await server.start();

  return server;
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

module.exports = init;
