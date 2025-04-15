import { execSync } from 'child_process';
import * as github from '@actions/github';
import * as core from '@actions/core';
import { OctokitInstance } from './types.js';

export function getCurrentCommitSha() {
  // If we're in a pull request event, use the commit SHA from the event payload
  if ((github.context.eventName === 'pull_request' || github.context.eventName === 'pull_request_target') && github.context.payload.pull_request) {
    core.info(`Pull request event detected, using PR commit SHA: ${github.context.payload.pull_request.head.sha}`);
    return github.context.payload.pull_request.head.sha;
  }

  const sha = execSync(`git rev-parse HEAD`).toString().trim();

  try {
    const msg = execSync(`git show ${sha} -s --format=%s`).toString().trim();
    const PR_MSG = /Merge (\w+) into \w+/i;

    if (PR_MSG.test(msg)) {
      const result = PR_MSG.exec(msg);

      if (result) {
        return result[1];
      }
    }
  } catch (e) {
    //
  }

  return sha;
}

export async function getAssociatedPullRequest(octokit: OctokitInstance, commitSha: string) {
  // If we're in a pull request event, use the PR number directly
  if ((github.context.eventName === 'pull_request' || github.context.eventName === 'pull_request_target') && github.context.payload.pull_request) {
    core.info(`Pull request event detected, using PR number: ${github.context.payload.pull_request.number}`);
    return github.context.payload.pull_request;
  }

  // Fallback to searching by commit SHA for other event types
  const result = await octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls', {
    ...github.context.repo,
    commit_sha: commitSha,
    mediaType: {
      format: 'json',
      previews: ['groot'],
    },
  });
  return result.data.length > 0 ? result.data[0] : null;
}
