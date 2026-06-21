# Registry and Document Generation System

A decoupled full-stack application built with a standalone Node.js Express backend, Next.js frontend, and MongoDB persistent storage.

## 🚀 Key Features

* **Authentication & Self-Registration**: Secure username/password self-registration using bcryptjs password hashing and JWT token-based HTTP-only session cookies.
* **SVG CAPTCHA Validation**: Custom server-generated randomized SVGs validated securely on the backend.
* **Personal Details Form**: Flat structured interface to input personal details with active validation.
* **Document Attachment Uploader**: Drag-and-drop uploader supporting JPG, PNG, and PDF formats (<5MB limits) stored as binary buffers in MongoDB.
* **Dynamic Document Generation**: Real-time generation of custom **A4 PDFs** (using `pdf-lib`) and **Word (.docx)** files containing submitted user profiles.
* **Profile Management**: Clean visual interface to read submitted profile details and reset account passwords.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js App Router, React, Vanilla CSS
* **Backend**: Node.js, Express, Mongoose (MongoDB)
* **Libraries**: `pdf-lib`, `docx`, `jsonwebtoken`, `bcryptjs`, `multer`

---

## 📂 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database configuration
│   │   ├── models/
│   │   │   ├── User.js               # Mongoose User model
│   │   │   └── Attachment.js         # Mongoose Attachment model
│   │   ├── middleware/
│   │   │   └── auth.middleware.js    # JWT authorization validator
│   │   ├── features/
│   │   │   ├── captcha/
│   │   │   │   ├── captcha.controller.js # CAPTCHA generation logic
│   │   │   │   └── captcha.routes.js     # GET /api/captcha
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js    # Register, login, logout, me logic
│   │   │   │   └── auth.routes.js        # Auth endpoint routing
│   │   │   ├── profile/
│   │   │   │   ├── profile.controller.js # Form save and change-password logic
│   │   │   │   └── profile.routes.js     # Form and profile updates routing
│   │   │   └── documents/
│   │   │       ├── documents.controller.js # PDF / Word document builders
│   │   │       └── documents.routes.js     # Document download endpoints
│   │   └── server.js                 # Main server initialization
│   └── package.json                  # Node.js backend dependencies
├── src/
│   ├── app/                          # Client components and page views
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── profile/
│   │   └── register/
│   └── components/                   # Navigation bar
├── next.config.ts                    # Next.js proxy rewrite configuration
├── .env                              # Port, JWT, and Database Connection parameters
└── tsconfig.json                     # TypeScript compiler options
```

---

## 💻 Local Setup & Installation

### Prerequisite Configuration
Create a `.env.local` or `.env` file at the root of the project with the following configuration:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=super_secret_session_token_key_12938479182374
PORT=3000
```

### 1. Install Dependencies
Run the installation commands in both frontend and backend directories:
```bash
# Install root (frontend) dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Running Locally

Start the standalone backend server and Next.js dev server in separate terminal windows:

* **Start Backend Server (Port 5001)**:
  ```bash
  cd backend
  npm start
  ```

* **Start Frontend Server (Port 3000)**:
  ```bash
  npm run dev
  ```

Once both servers are running, access the web client at: **[http://localhost:3000](http://localhost:3000)**

---

## ☁️ Deployment Guide

### Backend Deployment (e.g. Render)
1. Register a free account on **Render.com**.
2. Click **New** -> **Web Service** and link your GitHub repository.
3. Configure the settings:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `node src/server.js`
4. Add the Environment Variables:
   * `MONGODB_URI`: `<your-mongodb-atlas-string>`
   * `JWT_SECRET`: `<your-secure-random-string>`
5. Click **Deploy**.

### Frontend Deployment (Vercel)
1. Sign in to **Vercel.com** and import your repository.
2. Configure Environment Variables:
   * **Key**: `NEXT_PUBLIC_BACKEND_URL`
   * **Value**: `https://<your-render-url>.onrender.com` (Your deployed Render URL from above)
3. Click **Deploy**.
