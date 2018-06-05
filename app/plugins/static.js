'use strict';

module.exports = {
    name: 'staticAssetsPlugin',
    version: '1.0.0',
    register: async function (server, options) {
        await server.register(require('inert')),

        server.route({
            method: 'GET',
            path: '/static/js/{params*}',
            handler: {
                directory: {
                    path: './public/static/js'
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/{params*}',
            handler: {
                directory: {
                    index: true,
                    path: './public/'
                }
            }
        });
    }
};