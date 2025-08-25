#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Learning Ladder Data Validation Tool');
console.log('=====================================\n');

// Check if data.json exists
const dataPath = path.join(process.cwd(), 'data.json');
if (!fs.existsSync(dataPath)) {
  console.log('⚠️  data.json not found in project root');
  console.log('Creating empty data.json file...');
  fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
  console.log('✅ Empty data.json created successfully');
  process.exit(0);
}

try {
  // Read and parse data.json
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(rawData);
  
  console.log(`📊 Found ${data.length} learning entries`);
  
  // Validate structure
  if (!Array.isArray(data)) {
    throw new Error('data.json must contain an array');
  }
  
  const errors = [];
  const warnings = [];
  
  // Validate each learning day entry
  data.forEach((day, index) => {
    const required = ['id', 'dayNumber', 'date', 'title', 'description', 'attachments', 'links', 'isExpanded'];
    
    // Check required fields
    required.forEach(field => {
      if (!(field in day)) {
        errors.push(`Entry ${index}: Missing required field '${field}'`);
      }
    });
    
    if (errors.length > 0) return; // Skip further validation if required fields are missing
    
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
      errors.push(`Entry ${index}: 'date' must be in YYYY-MM-DD format (got: ${day.date})`);
    }
    
    // Validate attachments
    day.attachments.forEach((attachment, attIndex) => {
      if (!attachment.url || !attachment.title) {
        errors.push(`Entry ${index}, Attachment ${attIndex}: Missing url or title`);
      }
      if (attachment.url && !/^https?:\/\/.+/.test(attachment.url)) {
        errors.push(`Entry ${index}, Attachment ${attIndex}: Invalid URL format`);
      }
    });
    
    // Validate links
    day.links.forEach((link, linkIndex) => {
      if (!link.url || !link.title) {
        errors.push(`Entry ${index}, Link ${linkIndex}: Missing url or title`);
      }
      if (link.url && !/^https?:\/\/.+/.test(link.url)) {
        errors.push(`Entry ${index}, Link ${linkIndex}: Invalid URL format`);
      }
    });
    
    // Warnings for empty content
    if (!day.title.trim()) {
      warnings.push(`Entry ${index}: Empty title`);
    }
    if (!day.description.trim()) {
      warnings.push(`Entry ${index}: Empty description`);
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
  
  // Display results
  if (errors.length > 0) {
    console.log('\n❌ VALIDATION ERRORS:');
    errors.forEach(error => console.log(`   ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (errors.length === 0) {
    console.log('\n✅ Data validation passed!');
    
    // Generate summary
    const summary = {
      totalEntries: data.length,
      latestEntry: data.length > 0 ? data[data.length - 1].date : null,
      totalAttachments: data.reduce((sum, day) => sum + day.attachments.length, 0),
      totalLinks: data.reduce((sum, day) => sum + day.links.length, 0),
      averageAttachmentsPerDay: data.length > 0 ? (data.reduce((sum, day) => sum + day.attachments.length, 0) / data.length).toFixed(2) : 0,
      averageLinksPerDay: data.length > 0 ? (data.reduce((sum, day) => sum + day.links.length, 0) / data.length).toFixed(2) : 0,
    };
    
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Entries: ${summary.totalEntries}`);
    console.log(`   Latest Entry: ${summary.latestEntry || 'None'}`);
    console.log(`   Total Attachments: ${summary.totalAttachments}`);
    console.log(`   Total Links: ${summary.totalLinks}`);
    console.log(`   Avg Attachments/Day: ${summary.averageAttachmentsPerDay}`);
    console.log(`   Avg Links/Day: ${summary.averageLinksPerDay}`);
  }
  
  process.exit(errors.length > 0 ? 1 : 0);
  
} catch (error) {
  console.error('❌ Failed to validate data.json:', error.message);
  process.exit(1);
}