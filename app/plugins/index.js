'use strict';

const LOGGER_OPTIONS = {
  ops: {
    interval: 1000
  },
  reporters: {
    myConsoleReporter: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [
          {
            log: '*',
            response: '*'
          }
        ]
      },
      {
        module: 'good-console'
      },
      'stdout'
    ]
  }
};



module.exports = async (server) => {
  const registration = [
    server.register(require('./static')),
    server.register({
      plugin: require('good'),
      options: LOGGER_OPTIONS
    }),
    server.register(require('./pullrequests'), {
      routes: { prefix: '/api/pullrequests' }
    })
  ];

  return Promise.all(registration);
};
