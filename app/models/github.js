'use strict';

const chain = require('./chain');
const OrgChain = chain.OrgChain;
const RepoChain = chain.RepoChain;
const octokit = require('@octokit/rest')
const client = Symbol('client');


class FetchRepoPulls extends RepoChain {
    /**
     * Fetch all PRs in a given repository
     */
    async _exec({ client, org, repo, data = [] }) {
        let result = [];

        try {
            result = await client.pullRequests.getAll({
                owner: org,
                repo
            });
        } catch(e) {
            console.error(`Error encountered while fetching PR data for ${org}/${repo}`);
            console.error(e);
        }

        return { client, org, repo, data: result.data };
    }
}

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
        const fetchRepoPrs = repos.map(repo => this.repoFetcher.exec({ client, org, repo }));
        const repoPRs = await Promise.all(fetchRepoPrs);
        const result = repoPRs.map(repo => repo.data);

        return { client, org, repos, data: result };
    }
}

class FlattenPayload extends OrgChain {
    /**
     * Flatten an array of arrays into a single-level array
     */
    async _exec({ client, org, repos, data = [] }) {
        const result = data.reduce((agg, repo) => {
            // only process repositories with PRs (e.g., > 0)
            if (repo.length) {
                repo.forEach(pr => agg.push(pr));
            }

            return agg;
        }, []);

        return { client, org, repos, data: result };
    }
}

class SortByNew extends OrgChain {
    /**
     * Sort the PRs by most-recently updated to haven't-updated-in-a-while
     */
    async _exec(config) {
        config.data.sort((a, b) => (new Date(b.updated) - new Date(a.updated)));

        return config;
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
        } catch(e) {
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