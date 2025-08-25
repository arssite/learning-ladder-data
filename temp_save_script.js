const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

try {
  // Explicitly define the path to the module
  const modulePath = 'D:\\AnmolLocks\\learningladder\\src\\services\\githubService.js';
  console.log(`Attempting to require module from: ${modulePath}`);

  // Now require the service
  const githubServiceModule = require(modulePath);
  const { githubService } = githubServiceModule;
  console.log('Successfully required githubService.js');

  const mockData = [{
    id: Date.now(),
    dayNumber: 99,
    date: new Date().toISOString().split('T')[0],
    title: 'Test Save',
    description: 'Testing GitHub save functionality.',
    attachments: [],
    links: [],
    isExpanded: true,
  }];

  async function runSaveTest() {
    console.log('Attempting to save data to GitHub...');
    try {
      const success = await githubService.saveData(mockData);
      if (success) {
        console.log('Data save operation reported success.');
      } else {
        console.error('Data save operation reported failure.');
      }
    } catch (error) {
      console.error('An error occurred during the save test:', error);
    }
  }

  runSaveTest();

} catch (error) {
  console.error('Failed to load or execute githubService:', error);
}
