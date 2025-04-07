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

// Initialize Express app
const app = express();

// Setare 'trust proxy' pentru a rezolva problemele cu X-Forwarded-For
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.SECONDARY_FRONTEND_URL].filter(Boolean) 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(helmet());
app.use(morgan('dev'));

// Măresc limitele pentru bodyParser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Configurație pentru express-fileupload cu limite rezonabile
app.use((req, res, next) => {
  // Excludem rutele pentru contracte de la middleware-ul fileUpload pentru a evita probleme cu body parser-ul
  if (req.originalUrl.includes('/api/contracts/') || req.originalUrl.includes('/contracts/')) {
    console.log(`Bypassing fileUpload middleware for contract route: ${req.originalUrl}`);
    return next();
  }
  
  // Aplicăm middleware-ul fileUpload pentru toate celelalte rute
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    createParentPath: true,
    limits: { 
      fileSize: 50 * 1024 * 1024, // 50MB limită maximă
      abortOnLimit: true 
    },
    debug: process.env.NODE_ENV === 'development' // Debug doar în mod dezvoltare
  })(req, res, next);
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes - uncomment these as you implement them
const authRoutes = require('./routes/auth.routes');
const passwordRoutes = require('./routes/password.routes');
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);

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
const contractRoutes = require('./routes/contract.routes');
const emailRoutes = require('./routes/email.routes');

app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/email', emailRoutes);

// Rute alternative pentru compatibilitate cu aplicația mobilă
app.use('/contracts', contractRoutes);

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