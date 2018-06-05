'use strict';

class Chain {
    constructor(next) {
        this.next = next;
    }

    async exec(options) {
        const result = await this._exec(options);

        if (this.next) {
            return this.next.exec(result);
        }

        return result;
    }

    _exec(options) {
        throw new Error('Not implemented');
    }
}

class OrgChain extends Chain {
    /**
     * Chain that operates on org-level requests. Handles many repos under an org
     * @param {Object}   client     Client
     * @param {String}   org        Org that owns the repositories
     * @param {String[]} repos      List of repository names belonging to the Org
     * @param {Object[]} data       Arbitrary data transport
     */
    _exec({ client, org, repos, data = [] }) {
        throw new Error('Not implemented');
    }
}

class RepoChain extends Chain {
    /**
     * Chain that operates on repo-specific requests. Handles 1 repo
     * @param {Object}   client     Client
     * @param {String}   org        Org that owns the repositories
     * @param {String}   repo       The repository name belonging to the Org
     * @param {Object[]} data       Arbitrary data transport
     */
    _exec({ client, org, repo, data = [] }) {
        throw new Error('Not implemented');
    }
}

module.exports = {
    Chain,
    OrgChain,
    RepoChain
};