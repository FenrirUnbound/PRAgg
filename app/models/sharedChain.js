'use strict';

const { OrgChain, RepoChain } = require('./chain');

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
        } catch (e) {
            console.error(`Error encountered while fetching PR data for ${org}/${repo}`);
            console.error(e);
        }

        return { client, org, repo, data: result.data };
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

module.exports = {
    FetchRepoPulls,
    FlattenPayload,
    SortByNew
};