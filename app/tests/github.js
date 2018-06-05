'use strict';

const expect = require('chai').expect;

describe('Github Functional Test', () => {
    let server;

    before(async () => {
        const main = require('../server');

        server = await main();
    });

    after(async () => {
        if (server) {
            await server.stop();
        }

        server = null;
    });

    it('Works with default', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/api/pullrequests'
        });

        expect(response.statusCode).to.equal(200);

        const payload = JSON.parse(response.payload);

        expect(payload).to.deep.equal({
            data: [
                {
                    amount: 0,
                    name: 'Github.com',
                    pullRequests: [],
                    type: 'github'
                }
            ]
        });
    });
});