require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
const path = require('path');

// Import utilities and config
const logger = require('./utils/logger');
const connectDB = require('./config/database');
const fileUpload = require('express-fileupload');

// Import middlewares
const { errorHandler } = require('./middlewares/errorHandler');
// Eliminate express-fileupload since we're using multer for document uploads
// Update: Now using express-fileupload

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware handled with express-fileupload for document.routes.js
// și multer pentru admin.routes.js
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  limits: { fileSize: 100 * 1024 * 1024 } // 5MB max file size
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes - uncomment these as you implement them
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Enable these routes as they are implemented
const userRoutes = require('./routes/user.routes');
const clientRoutes = require('./routes/client.routes');
const groupRoutes = require('./routes/group.routes');
const documentRoutes = require('./routes/document.routes');
const adminRoutes = require('./routes/admin.routes');
const meetingRoutes = require('./routes/meeting.routes');
const notificationRoutes = require('./routes/notification.routes');
const activityRoutes = require('./routes/activity.routes');
const logRoutes = require('./routes/log.routes');

app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/logs', logRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to Startup Nation 2025 API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Error handling middleware
app.use(errorHandler);

// Schedule daily database backups
if (process.env.BACKUP_ENABLED === 'true') {
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled database backup...');
    try {
      const { runDatabaseBackup } = require('./utils/dbBackup');
      await runDatabaseBackup();
      logger.info('Database backup completed successfully');
    } catch (error) {
      logger.error(`Database backup failed: ${error.message}`);
    }
  });
}

// Start server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error(`Unhandled Rejection: ${error.message}`);
  process.exit(1);
});
