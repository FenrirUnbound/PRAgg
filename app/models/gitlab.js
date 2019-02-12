'use strict';

const GitlabClient = require('node-gitlab');
const { OrgChain, RepoChain } = require('./chain');
const { FlattenPayload, SortByNew } = require('./sharedChain');

const client = Symbol('client');

class CherryPickData extends RepoChain {
    async _exec({ client, org, repo, data = []}) {
        const result = data.map(({ author, created_at, description, iid, title, updated_at, web_url }) => ({
            body: description,
            created: created_at,
            id: iid,
            org,
            repo,
            title,
            updated: updated_at,
            url: web_url,
            user: {
                login: author.name,
                url: author.web_url
            }
        }));

        return { client, org, repo, data: result}
    }
}

class FetchMergeRequests extends RepoChain {
    async _exec({ client, org, repo, data = []}) {
        const result = await client.mergeRequests.list({
            id: parseInt(repo),
            state: 'opened'
        });

        return {
            client,
            org,
            repo,
            data: result
        };
    }
}

class FetchMergeRequestList extends OrgChain {
    constructor(next) {
        super(next);

        this.repoFetcher = new FetchMergeRequests(new CherryPickData());
    }

    async _exec({ client, org, repos, data = [] }) {
        const fetchRepoMergeRequests = repos.map(repo => this.repoFetcher.exec({ client, org, repo }));
        const repoMergeRequests = await Promise.all(fetchRepoMergeRequests);
        const result = repoMergeRequests.map(repo => repo.data);

        return { client, org, repos, data: result };
    }
}

class GitlabAggregator {
    constructor({ api, name, token }) {
        this[client] = GitlabClient.createPromise({
            api,
            privateToken: token
        });

        this.name = name;
        this.fetcher = new FetchMergeRequestList(new FlattenPayload(new SortByNew()));
    }

    async fetch(org, repos) {
        let mergeRequestData = [];

        try {
            const { data } = await this.fetcher.exec({
                client: this[client],
                org,
                repos
            });

            mergeRequestData = data;
        } catch(e) {
            console.error('error');
            console.error(e);
        }

        return {
            amount: mergeRequestData.length,
            name: this.name,
            pullRequests: mergeRequestData,
            type: 'gitlab'
        };
    }
}

module.exports = GitlabAggregator;