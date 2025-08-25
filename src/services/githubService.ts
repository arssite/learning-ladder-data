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
  // Cache for the last known SHA to detect changes
  lastKnownSha: null as string | null,
  
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
          const response = await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER!,
            repo: GITHUB_REPO!,
            path: 'data.json',
            message: `Update learning data - ${new Date().toISOString()}`,
            content,
            sha: file.data.sha,
            branch: GITHUB_BRANCH,
          });
          
          // Update the SHA cache
          if (response.data.content) {
            this.lastKnownSha = response.data.content.sha;
          }
        }
      } catch (error) {
        // File doesn't exist, create it
        const response = await octokit.repos.createOrUpdateFileContents({
          owner: GITHUB_OWNER!,
          repo: GITHUB_REPO!,
          path: 'data.json',
          message: 'Initial learning data',
          content,
          branch: GITHUB_BRANCH,
        });
        
        // Update the SHA cache
        if (response.data.content) {
          this.lastKnownSha = response.data.content.sha;
        }
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
        // Update the SHA cache
        this.lastKnownSha = response.data.sha;
        
        const content = Buffer.from(response.data.content, 'base64').toString();
        return JSON.parse(content);
      }

      return [];
    } catch (error) {
      console.error('Error loading from GitHub:', error);
      return [];
    }
  },

  async checkForUpdates(): Promise<{ hasUpdates: boolean; data?: LearningDay[] }> {
    try {
      const response = await octokit.repos.getContent({
        owner: GITHUB_OWNER!,
        repo: GITHUB_REPO!,
        path: 'data.json',
        ref: GITHUB_BRANCH,
      });

      if ('content' in response.data) {
        const currentSha = response.data.sha;
        
        // Check if the SHA has changed (indicating new data)
        if (this.lastKnownSha && this.lastKnownSha !== currentSha) {
          this.lastKnownSha = currentSha;
          const content = Buffer.from(response.data.content, 'base64').toString();
          const data = JSON.parse(content);
          
          return { hasUpdates: true, data };
        }
        
        // Update SHA if it's the first check
        if (!this.lastKnownSha) {
          this.lastKnownSha = currentSha;
        }
      }

      return { hasUpdates: false };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { hasUpdates: false };
    }
  },

  async getLatestCommit(): Promise<{ sha: string; message: string; date: string } | null> {
    try {
      const response = await octokit.repos.listCommits({
        owner: GITHUB_OWNER!,
        repo: GITHUB_REPO!,
        path: 'data.json',
        sha: GITHUB_BRANCH,
        per_page: 1,
      });

      if (response.data.length > 0) {
        const commit = response.data[0];
        return {
          sha: commit.sha,
          message: commit.commit.message,
          date: commit.commit.author?.date || new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting latest commit:', error);
      return null;
    }
  },

  async validateDataStructure(data: LearningDay[]): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if data is an array
      if (!Array.isArray(data)) {
        errors.push('Data must be an array');
        return { isValid: false, errors };
      }

      // Validate each learning day entry
      data.forEach((day, index) => {
        const required = ['id', 'dayNumber', 'date', 'title', 'description', 'attachments', 'links', 'isExpanded'];
        
        required.forEach(field => {
          if (!(field in day)) {
            errors.push(`Entry ${index}: Missing required field '${field}'`);
          }
        });

        // Validate data types
        if (typeof day.id !== 'number') errors.push(`Entry ${index}: 'id' must be a number`);
        if (typeof day.dayNumber !== 'number') errors.push(`Entry ${index}: 'dayNumber' must be a number`);
        if (typeof day.title !== 'string') errors.push(`Entry ${index}: 'title' must be a string`);
        if (typeof day.description !== 'string') errors.push(`Entry ${index}: 'description' must be a string`);
        if (!Array.isArray(day.attachments)) errors.push(`Entry ${index}: 'attachments' must be an array`);
        if (!Array.isArray(day.links)) errors.push(`Entry ${index}: 'links' must be an array`);
        if (typeof day.isExpanded !== 'boolean') errors.push(`Entry ${index}: 'isExpanded' must be a boolean`);

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
          errors.push(`Entry ${index}: 'date' must be in YYYY-MM-DD format`);
        }
      });

      // Check for duplicate IDs
      const ids = data.map(day => day.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        errors.push(`Duplicate IDs found: ${duplicateIds.join(', ')}`);
      }

      // Check for duplicate day numbers
      const dayNumbers = data.map(day => day.dayNumber);
      const duplicateDays = dayNumbers.filter((num, index) => dayNumbers.indexOf(num) !== index);
      if (duplicateDays.length > 0) {
        errors.push(`Duplicate day numbers found: ${duplicateDays.join(', ')}`);
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors };
    }
  }
};
