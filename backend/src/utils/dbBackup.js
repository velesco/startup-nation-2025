const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

// Create backup directory if it doesn't exist
const createBackupDirectory = () => {
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
};

// Generate backup filename with timestamp
const getBackupFilename = () => {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  return `backup_${timestamp}.gz`;
};

// Run MongoDB backup using mongodump
const runDatabaseBackup = async () => {
  try {
    const backupDir = createBackupDirectory();
    const backupFilename = getBackupFilename();
    const backupPath = path.join(backupDir, backupFilename);
    
    // Get database connection string from environment variables
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error('Database connection string is not defined');
    }
    
    // Parse connection string to get credentials and database name
    const dbUriRegex = /mongodb:\/\/(?:([^:]+):([^@]+)@)?([^:]+)(?::(\d+))?\/([^?]+)/;
    const match = dbUri.match(dbUriRegex);
    
    if (!match) {
      throw new Error('Invalid MongoDB connection string format');
    }
    
    const [, username, password, host, port = '27017', dbName] = match;
    
    // Build mongodump command
    let command = `mongodump --host ${host} --port ${port} --db ${dbName} --archive=${backupPath} --gzip`;
    
    if (username && password) {
      command += ` --username ${username} --password ${password} --authenticationDatabase admin`;
    }
    
    // Execute mongodump command
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('writing')) {
      throw new Error(`mongodump error: ${stderr}`);
    }
    
    // Clean up old backups (keep last 7 days of hourly backups)
    await cleanupOldBackups(backupDir);
    
    return {
      success: true,
      path: backupPath,
      filename: backupFilename,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Database backup error:', error);
    throw error;
  }
};

// Clean up old backups, keeping only the most recent ones
const cleanupOldBackups = async (backupDir) => {
  const files = fs.readdirSync(backupDir);
  
  // Sort files by creation time (oldest first)
  const fileStats = files
    .filter(file => file.startsWith('backup_') && file.endsWith('.gz'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      ctime: fs.statSync(path.join(backupDir, file)).ctime,
    }))
    .sort((a, b) => a.ctime.getTime() - b.ctime.getTime());
  
  // Keep only last 168 backups (7 days of hourly backups)
  const filesToDelete = fileStats.slice(0, Math.max(0, fileStats.length - 168));
  
  for (const file of filesToDelete) {
    fs.unlinkSync(file.path);
  }
  
  return filesToDelete.length;
};

// Restore database from backup file
const restoreDatabase = async (backupFilePath) => {
  try {
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`);
    }
    
    // Get database connection string from environment variables
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error('Database connection string is not defined');
    }
    
    // Parse connection string to get credentials and database name
    const dbUriRegex = /mongodb:\/\/(?:([^:]+):([^@]+)@)?([^:]+)(?::(\d+))?\/([^?]+)/;
    const match = dbUri.match(dbUriRegex);
    
    if (!match) {
      throw new Error('Invalid MongoDB connection string format');
    }
    
    const [, username, password, host, port = '27017', dbName] = match;
    
    // Build mongorestore command
    let command = `mongorestore --host ${host} --port ${port} --db ${dbName} --archive=${backupFilePath} --gzip --drop`;
    
    if (username && password) {
      command += ` --username ${username} --password ${password} --authenticationDatabase admin`;
    }
    
    // Execute mongorestore command
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('restoring')) {
      throw new Error(`mongorestore error: ${stderr}`);
    }
    
    return {
      success: true,
      path: backupFilePath,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Database restore error:', error);
    throw error;
  }
};

module.exports = {
  runDatabaseBackup,
  restoreDatabase,
  getBackupFilename,
  createBackupDirectory,
};
