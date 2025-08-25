import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { githubService } from './services/githubService';

// Mock the GitHub service
jest.mock('./services/githubService', () => ({
  githubService: {
    loadData: jest.fn(),
    saveData: jest.fn(),
    checkForUpdates: jest.fn(),
    validateDataStructure: jest.fn(),
    lastKnownSha: null,
  },
}));

const mockGithubService = githubService as jest.Mocked<typeof githubService>;

describe('Learning Ladder App', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockGithubService.loadData.mockResolvedValue([]);
    mockGithubService.saveData.mockResolvedValue(true);
    mockGithubService.checkForUpdates.mockResolvedValue({ hasUpdates: false });
    mockGithubService.validateDataStructure.mockResolvedValue({ isValid: true, errors: [] });
    
    // Clear localStorage
    localStorage.clear();
  });

  test('renders Learning Ladder title', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Learning Ladder')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays add day button', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Day')).toBeInTheDocument();
    });
  });

  test('shows sync status bar with total entries', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Total entries:/)).toBeInTheDocument();
    });
  });

  test('displays auto-sync toggle button', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Auto-sync ON')).toBeInTheDocument();
    });
  });

  test('can toggle auto-sync', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Auto-sync ON')).toBeInTheDocument();
    });

    // Find and click the auto-sync toggle button
    const autoSyncButton = screen.getByTitle(/Auto-sync enabled/);
    await user.click(autoSyncButton);
    
    await waitFor(() => {
      expect(screen.getByText('Auto-sync OFF')).toBeInTheDocument();
    });
  });

  test('loads data from GitHub on mount', async () => {
    const mockData = [
      {
        id: 1,
        dayNumber: 1,
        date: '2024-01-01',
        title: 'Test Learning Day',
        description: 'Test description',
        attachments: [],
        links: [],
        isExpanded: true,
      },
    ];

    mockGithubService.loadData.mockResolvedValue(mockData);
    
    render(<App />);
    
    await waitFor(() => {
      expect(mockGithubService.loadData).toHaveBeenCalled();
    });
  });

  test('handles GitHub service errors gracefully', async () => {
    mockGithubService.loadData.mockRejectedValue(new Error('GitHub API Error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Learning Ladder')).toBeInTheDocument();
    });
    
    // Should not crash and should show the app
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
