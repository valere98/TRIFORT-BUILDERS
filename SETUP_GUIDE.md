# TRIFORT BUILDERS - Production Setup Guide

## System Overview

TRIFORT BUILDERS is now fully migrated from demo mode to a production-ready system with:
- **Real Authentication**: JWT-based admin authentication with bcryptjs password hashing
- **MongoDB Database**: All data persisted in MongoDB
- **Secure API**: Protected endpoints with token verification
- **Admin Portal**: Complete dashboard for managing projects, contacts, and quotes

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.0 or higher) - Install from [mongodb.com](https://www.mongodb.com)
- **npm** (comes with Node.js)

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- nodemailer
- cors

### 2. Set Up Environment Variables

The `.env` file has been created with default values. Update it if needed:

```bash
# .env file location: e:\TRIFORT BUILDERS\.env

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/trifort_builders
JWT_SECRET=trifort-secret-key-change-in-production-2026
JWT_EXPIRY=7d
ADMIN_EMAIL=admin@trifort.com
ADMIN_PASSWORD=TrifortAdmin123!@#
ADMIN_NAME=Administrator
```

**Important**: Change `JWT_SECRET` and `ADMIN_PASSWORD` in production!

### 3. Initialize MongoDB Database

Make sure MongoDB is running, then initialize the database with the default admin user:

```bash
npm run init-db
```

**Output:**
```
MongoDB connected
Admin user created successfully
Email: admin@trifort.com
Password: TrifortAdmin123!@#
```

### 4. Start the Server

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will run on: `http://localhost:5000`

## Admin Login Credentials

After initialization:
- **Email**: `admin@trifort.com`
- **Password**: `TrifortAdmin123!@#`

⚠️ **Change these credentials after first login!**

## API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify token
- `GET /api/auth/me` - Get current user info

### Projects (All require JWT token)

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

### Contact Submissions

- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/all` - Get all contacts (admin)
- `PUT /api/contact/:id` - Update contact status (admin)
- `DELETE /api/contact/:id` - Delete contact (admin)

### Quote Requests

- `POST /api/quote/request` - Submit quote request
- `GET /api/quote/all` - Get all quotes (admin)
- `PUT /api/quote/:id` - Update quote status (admin)
- `DELETE /api/quote/:id` - Delete quote (admin)

## Frontend Pages

All pages now have consistent header/footer structure:

- `index.html` - Homepage
- `about.html` - About page
- `projects.html` - Projects listing
- `contact.html` - Contact & Quote forms
- `reviews.html` - Client testimonials
- `subcontractor.html` - Subcontractor info
- `admin-login.html` - Admin portal login
- `admin-dashboard.html` - Admin control panel (after login)

## File Structure

```
TRIFORT BUILDERS/
├── construction-website/
│   ├── backend/
│   │   ├── models/
│   │   │   ├── User.js (with bcryptjs hashing)
│   │   │   ├── Project.js
│   │   │   ├── Contact.js (NEW)
│   │   │   └── Quote.js (NEW)
│   │   ├── routes/
│   │   │   ├── auth.js (JWT-based)
│   │   │   ├── projects.js (MongoDB)
│   │   │   ├── contact.js (MongoDB)
│   │   │   └── quote.js (MongoDB)
│   │   ├── middleware/
│   │   │   └── authMiddleware.js (JWT verification)
│   │   ├── server.js (with MongoDB connection)
│   │   └── init-db.js (Database initialization)
│   ├── database/
│   │   └── schema.sql (Reference)
│   └── frontend/
│       ├── App.jsx
│       └── admin/
├── .env (Configuration)
├── package.json (with new dependencies)
└── [HTML pages with consistent header/footer]
```

## Key System Changes

### 1. Authentication System
- ✅ Replaced demo mode with real JWT authentication
- ✅ Passwords hashed with bcryptjs (10-round salt)
- ✅ Token expiry: 7 days (configurable)
- ✅ Secure token verification on protected endpoints

### 2. Database Integration
- ✅ All data now persists in MongoDB
- ✅ User authentication with password hashing
- ✅ Project management with full CRUD operations
- ✅ Contact submissions stored with status tracking
- ✅ Quote requests tracked from submission to approval

### 3. Admin Dashboard
- ✅ Requires login to access
- ✅ Display recent contacts and quote requests
- ✅ Manage project listings
- ✅ Update submission status

### 4. Consistent Frontend
- ✅ All HTML pages share header/footer structure
- ✅ Unified color scheme and typography
- ✅ Responsive design across devices
- ✅ Active navigation item highlighting

## Testing the System

### 1. Open Admin Portal
Navigate to: `http://localhost:5000/admin-login.html`

### 2. Login
```
Email: admin@trifort.com
Password: TrifortAdmin123!@#
```

### 3. Test API Endpoints

**Create a Project:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Project",
    "description": "Project description",
    "location": "City, Country",
    "completion_date": "2026-12-31"
  }'
```

**Submit Contact Form:**
```bash
curl -X POST http://localhost:5000/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "subject": "Project Inquiry",
    "message": "I would like to discuss my project"
  }'
```

## Frontend Integration

### Contact Form Submission Handler

The contact form on `contact.html` now:
1. Sends form data to `/api/contact/submit`
2. Displays success/error message
3. Clears form on successful submission
4. No longer relies on demo mode

### Admin Login Handler

The admin login on `admin-login.html` now:
1. Sends credentials to `/api/auth/login`
2. Receives JWT token from backend
3. Stores token in localStorage
4. Redirects to admin dashboard on success
5. Validates token before displaying dashboard

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running
- Check MONGODB_URI in .env file

### Admin Login Fails
```
Invalid email or password
```
- Ensure you ran `npm run init-db`
- Use correct credentials: admin@trifort.com / TrifortAdmin123!@#

### JWT Token Errors
```
401: Invalid token
```
- Token may have expired (7 days)
- Login again to get a new token
- Check Authorization header format: `Bearer TOKEN_HERE`

### Form Submissions Not Saving
- Check MongoDB connection
- Verify Contact/Quote models are loaded
- Check server logs for errors

## Security Best Practices

1. **Change default credentials immediately after deployment**
2. **Use strong JWT_SECRET in production** (min 32 characters)
3. **Enable HTTPS in production**
4. **Implement rate limiting on sensitive endpoints**
5. **Validate all user inputs on backend**
6. **Store sensitive data in .env (never commit to git)**
7. **Use environment-specific configurations**

## Next Steps for Production

1. Set up proper email service for contact form notifications
2. Implement email verification for admin accounts
3. Add password reset functionality
4. Set up automated backups for MongoDB
5. Implement logging and error tracking
6. Add rate limiting and CORS restrictions
7. Deploy to production server
8. Set up SSL/TLS certificates
9. Configure proper database backups
10. Monitor server performance and logs

## Support & Documentation

For more information, check:
- Backend routes in: `construction-website/backend/routes/`
- Models in: `construction-website/backend/models/`
- Environment configuration: `.env`

---

**Last Updated**: March 5, 2026
**Version**: 1.0.0 - Production Ready
