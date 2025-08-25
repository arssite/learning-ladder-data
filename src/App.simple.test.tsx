import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the GitHub service to avoid network calls
jest.mock('./services/githubService', () => ({
  githubService: {
    loadData: jest.fn().mockResolvedValue([]),
    saveData: jest.fn().mockResolvedValue(true),
    checkForUpdates: jest.fn().mockResolvedValue({ hasUpdates: false }),
    validateDataStructure: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    getLatestCommit: jest.fn().mockResolvedValue(null),
    lastKnownSha: null,
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Learning Ladder App - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Learning Ladder')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('contains main app structure', () => {
    render(<App />);
    // Check for main container
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });
});