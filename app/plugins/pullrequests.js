'use strict';

const config = require('config');

const STRATEGIES = {
    github: require('../models/github')
};

module.exports = {
    name: 'pullrequests',
    version: '1.0.0',
    register: async function (server, options) {
        server.route({
            method: 'GET',
            path: '/',
            handler: async function (request, h) {
                const scms = config.get('scm');
                const fetchData = scms.map((scm) => {
                    const Strategy = STRATEGIES[scm.type];

                    if (!Strategy) {
                        throw new Error(`Unknown strategy ${scm.name}`);
                    }

                    const client = new Strategy({
                        api: scm.api,
                        name: scm.name,
                        token: scm.token || config.get('auth').github
                    });

                    try {
                        const result = client.fetch(scm.org, scm.repos);

                        return result;
                    } catch(e) {
                        console.error(e);

                        throw e;
                    }
                });

                const data = await Promise.all(fetchData);

                return {
                    data
                };
            }
        });
    }
};