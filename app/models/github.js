'use strict';

const { OrgChain, RepoChain } = require('./chain');
const {
    FetchRepoPulls,
    FlattenPayload,
    SortByNew
} = require('./sharedChain');
const octokit = require('@octokit/rest')
const client = Symbol('client');

class CherryPickData extends RepoChain {
    /**
     * Mutate the PR data to the attributes we care about
     */
    async _exec({ client, org, repo, data = [] }) {
        const result = data.map(({ body, created_at, html_url, number, requested_reviewers, title, updated_at, user }) => ({
            body,
            created: created_at,
            id: number,
            org,
            repo,
            requestedReviewers: requested_reviewers,
            title,
            updated: updated_at,
            url: html_url,
            user: {
                login: user.login,
                url: user.html_url
            }
        }));

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
        //todo: fetch all repos if repos is empty

        const fetchRepoPrs = repos.map(repo => this.repoFetcher.exec({ client, org, repo }));
        const repoPRs = await Promise.all(fetchRepoPrs);
        const result = repoPRs.map(repo => repo.data);

        return { client, org, repos, data: result };
    }
}

class Github {
    constructor({ api, name, token }) {
        this[client] = octokit({
            baseUrl: api
        });
        this[client].authenticate({
            type: 'token',
            token: token
        });
        this.name = name;
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
            type: 'github'
        };
    }
}

module.exports = Github;