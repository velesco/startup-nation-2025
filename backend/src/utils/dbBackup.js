const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const logger = require('./logger');

// Path for storing backups
const backupDir = path.join(__dirname, '../../backups');

/**
 * Run MongoDB database backup using mongodump
 */
const runDatabaseBackup = async () => {
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Format date for filename
    const date = new Date();
    const formattedDate = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const backupFilename = `backup_${formattedDate}.gz`;
    const backupPath = path.join(backupDir, backupFilename);

    // Build mongodump command
    let command = `mongodump --uri="${process.env.MONGODB_URI}" --archive="${backupPath}" --gzip`;

    // Add authentication if provided
    if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
      command = `mongodump --uri="${process.env.MONGODB_URI}" --username="${process.env.MONGODB_USER}" --password="${process.env.MONGODB_PASSWORD}" --archive="${backupPath}" --gzip`;
    }

    // Execute mongodump
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('writing')) {
      logger.warn(`Backup warning: ${stderr}`);
    }

    logger.info(`Database backup created: ${backupFilename}`);

    // Remove old backups based on retention policy
    await cleanupOldBackups();
    
    return {
      success: true,
      message: 'Backup completed successfully',
      filename: backupFilename,
      path: backupPath
    };
  } catch (error) {
    logger.error(`Backup error: ${error.message}`);
    throw new Error(`Database backup failed: ${error.message}`);
  }
};

/**
 * Clean up old backup files based on retention policy
 */
const cleanupOldBackups = async () => {
  try {
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 7;
    
    // List all files in the backup directory
    const files = fs.readdirSync(backupDir);
    
    // Get current time
    const now = new Date().getTime();
    
    // Calculate retention period in milliseconds
    const retentionPeriod = retentionDays * 24 * 60 * 60 * 1000;
    
    // Filter and delete old backup files
    for (const file of files) {
      // Only process backup files
      if (!file.startsWith('backup_')) continue;
      
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      
      // Check if file is older than retention period
      if (now - stats.mtime.getTime() > retentionPeriod) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted old backup: ${file}`);
      }
    }
    
    logger.info('Backup cleanup completed');
  } catch (error) {
    logger.error(`Backup cleanup error: ${error.message}`);
  }
};

/**
 * Restore database from backup file
 * @param {string} backupFile - Path to the backup file
 */
const restoreDatabase = async (backupFile) => {
  try {
    // Check if backup file exists
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }
    
    // Build mongorestore command
    let command = `mongorestore --uri="${process.env.MONGODB_URI}" --archive="${backupFile}" --gzip`;
    
    // Add authentication if provided
    if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
      command = `mongorestore --uri="${process.env.MONGODB_URI}" --username="${process.env.MONGODB_USER}" --password="${process.env.MONGODB_PASSWORD}" --archive="${backupFile}" --gzip`;
    }
    
    // Execute mongorestore
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('restoring') && !stderr.includes('done')) {
      logger.warn(`Restore warning: ${stderr}`);
    }
    
    logger.info(`Database restore completed from: ${backupFile}`);
    
    return {
      success: true,
      message: 'Restore completed successfully',
      file: backupFile
    };
  } catch (error) {
    logger.error(`Restore error: ${error.message}`);
    throw new Error(`Database restore failed: ${error.message}`);
  }
};

/**
 * List available backup files
 */
const listBackups = () => {
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      return [];
    }
    
    // List all files in the backup directory
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup_'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          path: filePath,
          size: stats.size,
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created); // Sort by date desc
    
    return files;
  } catch (error) {
    logger.error(`List backups error: ${error.message}`);
    throw new Error(`Failed to list backups: ${error.message}`);
  }
};

module.exports = {
  runDatabaseBackup,
  cleanupOldBackups,
  restoreDatabase,
  listBackups
};
