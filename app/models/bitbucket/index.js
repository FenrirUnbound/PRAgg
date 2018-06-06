'use strict';

const Client = require('./client');
const client = Symbol('client');
const {
    FetchRepoPulls,
    FlattenPayload,
    SortByNew
} = require('../sharedChain');
const { OrgChain, RepoChain } = require('../chain');

class CherryPickData extends RepoChain {
    /**
     * Mutate the PR data to the attributes we care about
     */
    async _exec({ client, org, repo, data = [] }) {
        const result = data.map(({ author, createdDate, id, links, title, updatedDate }) => {
            const url = (links && links.self && links.self.length > 0) ? links.self[0].href : '';

            return {
                created: createdDate,
                id,
                links,
                title,
                updated: updatedDate,
                url,
                user: {
                    login: author.user.name,
                    url: author.user.links.self[0].href
                }
            };
        });

        return { client, org, repo, data: result };
    }
}

class FetchOrgPulls extends OrgChain {
    constructor(next) {
        super(next);

        this.repoFetcher = new FetchRepoPulls(new CherryPickData());
    }

    /**
     * Fetch all PRs associated with an organization
     */
    async _exec({ client, org, repos, data = [] }) {
        const fetchRepoPrs = repos.map(repo => this.repoFetcher.exec({ client, org, repo }));
        const repoPRs = await Promise.all(fetchRepoPrs);
        const result = repoPRs.map(repo => repo.data);

        return { client, org, repos, data: result };
    }
}

class Bitbucket {
    constructor({ api, name, token }) {
        this.api = api;
        this.name = name;

        this[client] = new Client({ api, token });
        this.fetcher = new FetchOrgPulls(new FlattenPayload(new SortByNew()));
    }

    /**
     * Fetch the PRs from the list of repositories owned by the org
     * @param {String}      org     The org that owns the repositories
     * @param {String[]}    [repos] List of repositories that the org owns. An
     *                              empty list will return all repositories
     */
    async fetch(org, repos) {
        let pullRequestData = [];

        try {
            const { data } = await this.fetcher.exec({
                client: this[client],
                org,
                repos
            });

            pullRequestData = data;
        } catch (e) {
            console.error('error');
            console.error(e);
        }

        return {
            amount: pullRequestData.length,
            name: this.name,
            pullRequests: pullRequestData,
            type: 'bitbucket'
        };
    }
}

module.exports = Bitbucket;