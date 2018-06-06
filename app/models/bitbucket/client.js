'use strict';

const request = require('request');
const tokenSymbol = Symbol('token');

class PullRequests {
    constructor({ api, token }) {
        this.api = api;
        this[tokenSymbol] = token;
    }

    async _sendRequest(options) {
        const config = Object.assign(options, {
            auth: {
                bearer: this[tokenSymbol]
            },
            method: 'GET',
            json: true
        });

        return new Promise((resolve, reject) => {
            request(config, (err, response, body) => {
                if (err) {
                    return reject(err);
                }

                return resolve(response);
            });
        });
    }

    /**
     * getAll
     * @param {String} owner    Organization that owns the repo
     * @param {String} repo     SlugID of the repo
     */
    async getAll({ owner, repo }) {
        const uri = `${this.api}/rest/api/1.0/projects/${owner}/repos/${repo}/pull-requests`;
        const data = await this._sendRequest({ uri });

        return {
            data: data.body.values
        };
    }
}

class BitbucketClient {
    constructor({ api, token }) {
        this.api = api;

        this._pullRequests = new PullRequests({ api, token });
    }

    get pullRequests() {
        return this._pullRequests;
    }
}

module.exports = BitbucketClient;