# TRIFORT Builders - Website Setup & Startup Guide

## Project Structure

```
e:\TRIFORT BUILDERS\
├── construction-website/
│   └── backend/
│       ├── server.js (Main Express server)
│       ├── routes/
│       │   ├── auth.js (Admin authentication)
│       │   ├── contact.js (Contact form submissions)
│       │   ├── quote.js (Quote request handling)
│       │   └── projects.js (Project management)
│       ├── models/
│       │   ├── User.js (Admin user schema)
│       │   └── Project.js (Project schema)
│       └── middleware/
├── index.html (Homepage)
├── about.html (About page)
├── projects.html (Projects portfolio)
├── reviews.html (Testimonials)
├── contact.html (Contact & Quote forms)
├── subcontractor.html (Subcontractor info)
├── admin-login.html (Admin login portal)
├── admin-dashboard.html (Admin control panel)
├── package.json (Dependencies)
└── README.md (Project info)
```

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

## Installation & Startup

### Step 1: Install Dependencies
```bash
cd "e:\TRIFORT BUILDERS"
npm install
```

This will install:
- express (web server)
- cors (cross-origin requests)
- dotenv (environment variables)
- nodemailer (email functionality)
- express-validator (form validation)

### Step 2: Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
Serving static files from: e:\TRIFORT BUILDERS\
```

### Step 3: Access the Website
- **Public Site:** http://localhost:5000
- **Admin Login:** http://localhost:5000/admin-login.html
- **Admin Dashboard:** http://localhost:5000/admin-dashboard.html (after login)

## Features Implemented

### Public Website
- ✅ Responsive HTML pages (Home, About, Projects, Reviews, Contact, Subcontractor)
- ✅ Contact form with backend submission
- ✅ Quote request form with project type selection
- ✅ Navigation menu with active page highlighting
- ✅ Professional footer with company info
- ✅ Logo display with circular badge design
- ✅ CSS animations (slide-in, fade-in effects)
- ✅ Oval button styles with hover animations

### Admin Portal
- ✅ Dedicated admin login page
- ✅ Admin dashboard with overview statistics
- ✅ Contact submissions management
- ✅ Quote requests review
- ✅ Project portfolio management (add/edit/delete)
- ✅ Settings page (password change, logout)
- ✅ Responsive sidebar navigation

### Backend API Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify admin token

#### Contacts
- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/all` - Get all contact submissions (admin)

#### Quotes
- `POST /api/quote/request` - Submit quote request
- `GET /api/quote/all` - Get all quote requests (admin)

#### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

#### Health Check
- `GET /api/health` - Server status

## Form Data Specifications

### Contact Form
```javascript
{
  name: string,
  email: string,
  phone: string (optional),
  subject: string (optional),
  message: string
}
```

### Quote Request Form
```javascript
{
  name: string,
  email: string,
  phone: string,
  projectType: string (residential|commercial|industrial|renovation|other),
  details: string
}
```

### Admin Login
```javascript
{
  email: string,
  password: string
}
```

## Current Data Storage

- **Forms & Submissions:** In-memory storage (persists during server session)
- **Projects:** In-memory storage with sample data
- **Authentication:** Demo mode (accepts any credentials with token 'demo-token-123')

**Note:** For production, integrate MongoDB or another database service.

## Styling System

### CSS Color Variables
```css
--emerald: #0f4c3a (Primary brand color)
--gold: #b49450 (Accent color)
--cream: #faf7f0 (Background color)
--charcoal: #2c3e3a (Text color)
--sand: #e8e0d0 (Border color)
```

### Animation Classes
- `.animate-slide-left` - Slide in from left
- `.animate-slide-right` - Slide in from right
- `.animate-fade` - Fade in animation

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, you can change it:
```bash
set PORT=3000 && npm start
```

### CORS Issues
CORS is already enabled in server.js for all origins. No additional configuration needed for local development.

### Static Files Not Loading
Ensure the server is running and check the console output shows:
```
Serving static files from: e:\TRIFORT BUILDERS\
```

### Forms Not Submitting
1. Check browser console for errors (F12)
2. Verify server is running on http://localhost:5000
3. Check network tab to see API responses
4. Ensure form field names match API expectations

## Next Steps for Production

1. **Database Integration**
   - Set up MongoDB connection
   - Replace in-memory storage with database queries
   - Update models with validation

2. **Authentication**
   - Implement JWT token generation
   - Add password hashing (bcrypt)
   - Implement token verification middleware

3. **Email Notifications**
   - Configure nodemailer with email service
   - Send confirmation emails for submissions
   - Send admin notifications for new quotes

4. **SSL/HTTPS**
   - Get SSL certificate
   - Configure HTTPS server

5. **Deployment**
   - Choose hosting platform (Heroku, AWS, DigitalOcean, etc.)
   - Set up environment variables
   - Configure production database

## Support

For issues or questions, contact V § OUT Solutions.

Created: 2026
Version: 1.0.0
