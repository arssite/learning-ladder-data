import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const GITHUB_OWNER = process.env.REACT_APP_GITHUB_OWNER;
const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO;
const GITHUB_BRANCH = process.env.REACT_APP_GITHUB_BRANCH || 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export interface Attachment {
  type: 'image' | 'video' | 'pdf' | 'doc' | 'link' | 'other';
  url: string;
  title: string;
  previewUrl?: string;
}

export interface ExternalLink {
  url: string;
  title: string;
}

export interface LearningDay {
  id: number;
  dayNumber: number;
  date: string;
  title: string;
  description: string;
  attachments: Attachment[];
  links: ExternalLink[];
  isExpanded: boolean;
}

export const githubService = {
  async saveData(data: LearningDay[]) {
    try {
      const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
      
      // Try to get the file first
      try {
        const file = await octokit.repos.getContent({
          owner: GITHUB_OWNER!,
          repo: GITHUB_REPO!,
          path: 'data.json',
          ref: GITHUB_BRANCH,
        });

        if ('content' in file.data) {
          // Update existing file
          await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER!,
            repo: GITHUB_REPO!,
            path: 'data.json',
            message: `Update learning data - ${new Date().toISOString()}`,
            content,
            sha: file.data.sha,
            branch: GITHUB_BRANCH,
          });
        }
      } catch (error) {
        // File doesn't exist, create it
        await octokit.repos.createOrUpdateFileContents({
          owner: GITHUB_OWNER!,
          repo: GITHUB_REPO!,
          path: 'data.json',
          message: 'Initial learning data',
          content,
          branch: GITHUB_BRANCH,
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving to GitHub:', error);
      return false;
    }
  },

  async loadData(): Promise<LearningDay[]> {
    try {
      const response = await octokit.repos.getContent({
        owner: GITHUB_OWNER!,
        repo: GITHUB_REPO!,
        path: 'data.json',
        ref: GITHUB_BRANCH,
      });

      if ('content' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString();
        return JSON.parse(content);
      }

      return [];
    } catch (error) {
      console.error('Error loading from GitHub:', error);
      return [];
    }
  }
};
