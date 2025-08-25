# Learning Ladder 🪜

A React-based learning journal application with real-time GitHub synchronization and automated CI/CD pipeline.

## 🌟 Features

- **📝 Learning Journal**: Track daily learning progress with rich content
- **🔄 Real-time Sync**: Automatic synchronization with GitHub repository
- **📊 Data Validation**: Built-in validation for data integrity
- **🚀 CI/CD Pipeline**: Automated testing and deployment
- **💾 Dual Storage**: GitHub primary storage with localStorage fallback
- **🔍 Auto-refresh**: Detects remote changes and updates automatically
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Data Flow
```
Frontend ↔ data.json (GitHub) ↔ CI/CD Pipeline
    ↕
localStorage (Fallback)
```

### Key Components
- **LearningLadder**: Main UI component with CRUD operations
- **githubService**: GitHub API integration and data management
- **useGitHubData**: Custom hook for state management and sync
- **GitHub Actions**: Automated validation and deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- GitHub repository for data storage
- GitHub Personal Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd learningladder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file:
   ```env
   REACT_APP_GITHUB_TOKEN=your_github_token_here
   REACT_APP_GITHUB_OWNER=your_github_username
   REACT_APP_GITHUB_REPO=your_repo_name
   REACT_APP_GITHUB_BRANCH=learning-ladder-data
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## 📋 Available Scripts

### Development
- `npm start` - Start development server
- `npm test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run validate-data` - Validate data.json structure

### Production
- `npm run build` - Build for production
- `npm run deploy` - Deploy to GitHub Pages
- `npm run test:ci` - Run tests for CI environment

## 🔧 Configuration

### GitHub Setup

1. **Create a GitHub repository** for your learning data
2. **Generate a Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create token with `repo` permissions
3. **Set up repository secrets** (for GitHub Actions):
   - `REACT_APP_GITHUB_TOKEN`: Your GitHub token

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_GITHUB_TOKEN` | GitHub Personal Access Token | `github_pat_...` |
| `REACT_APP_GITHUB_OWNER` | GitHub username/organization | `yourusername` |
| `REACT_APP_GITHUB_REPO` | Repository name | `learning-ladder-data` |
| `REACT_APP_GITHUB_BRANCH` | Branch for data storage | `learning-ladder-data` |

## 🔄 CI/CD Pipeline

### Automated Workflows

1. **Data Validation** (`.github/workflows/data-validation.yml`)
   - Triggers on `data.json` changes
   - Validates data structure and integrity
   - Generates data reports
   - Runs on every push to `learning-ladder-data` branch

2. **Deployment** (`.github/workflows/deploy.yml`)
   - Builds and deploys to GitHub Pages
   - Runs tests before deployment
   - Triggers on pushes to main branches

### Data Validation Rules

- ✅ Valid JSON array structure
- ✅ Required fields: `id`, `dayNumber`, `date`, `title`, `description`, `attachments`, `links`, `isExpanded`
- ✅ Correct data types for all fields
- ✅ Date format: `YYYY-MM-DD`
- ✅ Valid URLs for attachments and links
- ✅ No duplicate IDs or day numbers

## 📊 Data Structure

### Learning Day Entry
```typescript
interface LearningDay {
  id: number;              // Unique identifier
  dayNumber: number;       // Sequential day number
  date: string;           // Date in YYYY-MM-DD format
  title: string;          // Learning topic/title
  description: string;    // Detailed description
  attachments: Attachment[]; // Files, images, etc.
  links: ExternalLink[];  // Resource links
  isExpanded: boolean;    // UI state
}
```

### Attachment Structure
```typescript
interface Attachment {
  type: 'image' | 'video' | 'pdf' | 'doc' | 'link' | 'other';
  url: string;
  title: string;
  previewUrl?: string;
}
```

## 🔄 Real-time Synchronization

### Auto-sync Features
- **Polling**: Checks for updates every 30 seconds
- **Visibility API**: Syncs when tab becomes active
- **SHA Tracking**: Detects changes using Git SHA comparison
- **Conflict Resolution**: GitHub data takes precedence
- **Offline Support**: Falls back to localStorage

### Manual Controls
- **Refresh Button**: Force data refresh from GitHub
- **Auto-sync Toggle**: Enable/disable automatic synchronization
- **Sync Status**: Visual indicators for sync state

## 🧪 Testing

### Test Coverage
- Component rendering and interactions
- GitHub service integration
- Data validation logic
- Error handling scenarios

### Running Tests
```bash
# Interactive mode
npm test

# Coverage report
npm run test:coverage

# CI mode
npm run test:ci
```

## 🚀 Deployment

### GitHub Pages (Automatic)
1. Push changes to main branch
2. GitHub Actions automatically builds and deploys
3. Access at: `https://yourusername.github.io/your-repo-name`

### Manual Deployment
```bash
npm run deploy
```

## 🔍 Data Validation

### Manual Validation
```bash
npm run validate-data
```

### Validation Output
- ✅ Structure validation
- 📊 Data statistics
- ⚠️ Warnings for empty content
- ❌ Errors for invalid data

## 🛠️ Development Workflow

### Adding New Learning Entries
1. Click "Add Day" button
2. Fill in title and description
3. Add attachments/links (optional)
4. Save - automatically syncs to GitHub
5. CI/CD pipeline validates and deploys

### Data Flow Process
1. **User Input** → Frontend validation
2. **Local Save** → Update React state
3. **GitHub Sync** → Push to repository
4. **CI Validation** → Automated checks
5. **Deployment** → Update live site

## 🔧 Troubleshooting

### Common Issues

**Sync Failures**
- Check GitHub token permissions
- Verify repository exists
- Ensure branch name is correct

**Validation Errors**
- Run `npm run validate-data` locally
- Check data.json structure
- Fix any reported errors

**Build Failures**
- Check environment variables
- Verify all dependencies installed
- Review GitHub Actions logs

## 📈 Monitoring

### Available Metrics
- Total learning entries
- Last sync timestamp
- Sync success/failure rates
- Data validation results
- Deployment status

### GitHub Actions Reports
- Data validation reports
- Test coverage reports
- Build and deployment logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request
5. Automated tests will run

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy Learning! 🎓**
