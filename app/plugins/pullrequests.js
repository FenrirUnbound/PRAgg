'use strict';

const config = require('config');

const STRATEGIES = {
    bitbucket: require('../models/bitbucket'),
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
                        console.error(`Unknown strategy "${scm.name}". Skipping...`);

                        // todo: silent failures should be known
                        return Promise.resolve({
                            name: scm.name,
                            amount: 0,
                            pullRequests: []
                        });
                    }

                    const client = new Strategy({
                        api: scm.api,
                        name: scm.name,
                        token: scm.token || config.get('auth')[scm.type]
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