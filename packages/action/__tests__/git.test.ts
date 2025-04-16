import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as github from '@actions/github';
import { getAssociatedPullRequest } from '../src/git.js';
import { OctokitInstance } from '../src/types.js';

vi.mock('@actions/github');

describe('git', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAssociatedPullRequest', () => {
    it('should return pull request from event context when in pull request event', async () => {
      // Mock GitHub context for pull request event
      vi.spyOn(github, 'context', 'get').mockImplementation(() => ({
        eventName: 'pull_request',
        payload: {
          pull_request: {
            number: 123,
            state: 'open',
            base: { ref: 'master' },
          },
        },
        repo: {
          owner: 'test-owner',
          repo: 'test-repo',
        },
        sha: 'test-sha',
        ref: 'refs/pull/123/merge',
        workflow: 'test-workflow',
        action: 'test-action',
        actor: 'test-actor',
        job: 'test-job',
        runNumber: 1,
        runId: 1,
        apiUrl: 'https://api.github.com',
        serverUrl: 'https://github.com',
        graphqlUrl: 'https://api.github.com/graphql',
        issue: {
          owner: 'test-owner',
          repo: 'test-repo',
          number: 123,
        },
      }));

      const mockOctokit = {
        request: vi.fn(),
        rest: {
          checks: {
            listForRef: vi.fn().mockResolvedValue({
              data: [],
            }),
          },
          pulls: {
            list: vi.fn().mockResolvedValue({
              data: [],
            }),
          },
        },
      } as unknown as OctokitInstance;

      const result = await getAssociatedPullRequest(mockOctokit, 'test-sha');

      expect(result).toEqual({
        number: 123,
        state: 'open',
        base: { ref: 'master' },
      });
      expect(mockOctokit.request).not.toHaveBeenCalled();
    });

    it('should fall back to commit search for non-pull-request events', async () => {
      // Mock GitHub context for push event
      vi.spyOn(github, 'context', 'get').mockImplementation(() => ({
        eventName: 'push',
        payload: {},
        repo: {
          owner: 'test-owner',
          repo: 'test-repo',
        },
        sha: 'test-sha',
        ref: 'refs/heads/master',
        workflow: 'test-workflow',
        action: 'test-action',
        actor: 'test-actor',
        job: 'test-job',
        runNumber: 1,
        runId: 1,
        apiUrl: 'https://api.github.com',
        serverUrl: 'https://github.com',
        graphqlUrl: 'https://api.github.com/graphql',
        issue: {
          owner: 'test-owner',
          repo: 'test-repo',
          number: 123,
        },
      }));

      const mockOctokit = {
        request: vi.fn().mockResolvedValue({
          data: [{
            number: 456,
            state: 'open',
            base: { ref: 'master' },
          }],
        }),
        rest: {
          checks: {
            create: vi.fn(),
          },
        },
      } as unknown as OctokitInstance;

      const result = await getAssociatedPullRequest(mockOctokit, 'test-sha');

      expect(result).toEqual({
        number: 456,
        state: 'open',
        base: { ref: 'master' },
      });
      expect(mockOctokit.request).toHaveBeenCalledWith(
        'GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls',
        {
          owner: 'test-owner',
          repo: 'test-repo',
          commit_sha: 'test-sha',
          mediaType: {
            format: 'json',
            previews: ['groot'],
          },
        },
      );
    });

    it('should return null when no pull request is found in non-pull-request events', async () => {
      // Mock GitHub context for push event
      vi.spyOn(github, 'context', 'get').mockImplementation(() => ({
        eventName: 'push',
        payload: {},
        repo: {
          owner: 'test-owner',
          repo: 'test-repo',
        },
        sha: 'test-sha',
        ref: 'refs/heads/master',
        workflow: 'test-workflow',
        action: 'test-action',
        actor: 'test-actor',
        job: 'test-job',
        runNumber: 1,
        runId: 1,
        apiUrl: 'https://api.github.com',
        serverUrl: 'https://github.com',
        graphqlUrl: 'https://api.github.com/graphql',
        issue: {
          owner: 'test-owner',
          repo: 'test-repo',
          number: 123,
        },
      }));

      const mockOctokit = {
        request: vi.fn().mockResolvedValue({
          data: [],
        }),
        rest: {
          checks: {
            create: vi.fn(),
          },
        },
      } as unknown as OctokitInstance;

      const result = await getAssociatedPullRequest(mockOctokit, 'test-sha');

      expect(result).toBeNull();
      expect(mockOctokit.request).toHaveBeenCalled();
    });
  });
}); 