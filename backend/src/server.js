const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');

const envLocalPath = path.join(__dirname, '../../.env.local');
const envPath = path.join(__dirname, '../../.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const { connectToDatabase } = require('./config/db');
const { updateDetails, changePassword } = require('./features/profile/profile.controller');
const { authenticateToken } = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.BACKEND_PORT || 5001;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use('/api/captcha', require('./features/captcha/captcha.routes'));
app.use('/api/auth', require('./features/auth/auth.routes'));
app.use('/api/documents', require('./features/documents/documents.routes'));

app.post('/api/details', authenticateToken, upload.single('file'), updateDetails);
app.post('/api/profile/change-password', authenticateToken, changePassword);

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
