# Login Issue Analysis & Fixes

## Problems Identified

### 1. ❌ Wrong bcrypt Import in auth.js
**Issue**: Line 23 was importing `bcrypt` module dynamically instead of using the already-imported `bcryptjs`
**Impact**: Could cause module not found errors at runtime

**Fixed**: Changed to use `bcryptjs` at the top of the file
```javascript
// BEFORE (Wrong)
const bcrypt = require('bcrypt');
const isPasswordValid = await bcrypt.compare(password, user.password_hash);

// AFTER (Correct)
const bcryptjs = require('bcryptjs');
const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
```

### 2. ❌ CORS Not Configured for Cross-Origin Requests
**Issue**: Backend had `app.use(cors())` without origin whitelist
**Impact**: Vercel frontend → Render backend calls may be blocked by browser CORS policy
- Frontend domain: `https://trifort-builders.vercel.app`
- Backend domain: `https://trifort-builders.onrender.com`

**Fixed**: Added explicit CORS configuration with allowed origins
```javascript
const corsOptions = {
    origin: [
        'https://trifort-builders.vercel.app',
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

## Required Render Environment Variables

On **Render.com**, you MUST set these in the Web Service environment:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=<your-long-random-secret-minimum-32-chars>
NODE_ENV=production
PORT=10000
```

**How to set on Render:**
1. Go to your Render Web Service dashboard
2. Click "Environment" tab
3. Add each key-value pair above
4. Deploy or trigger a manual deploy

## Verifying Connectivity

### Check Backend Health
```bash
curl https://trifort-builders.onrender.com/api/health
```

Expected response:
```json
{
    "status": "Server running",
    "timestamp": "...",
    "environment": "production"
}
```

### Check MongoDB Connection
- Verify `MONGO_URI` is correct in Render environment
- Test with: `mongosh <MONGO_URI>`

### Check JWT Configuration
- Verify `JWT_SECRET` is set (min 32 characters)
- Must be different between environments

## Frontend Configuration (Vercel)

The frontend URL in [admin-login.html](admin-login.html) line 263 must match your Render backend:

```javascript
const res = await fetch('https://trifort-builders.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});
```

**If your Render URL is different**, update this line in admin-login.html AND ensure Render's environment variable JWT_SECRET is set.

## Testing Locally First

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file** in project root:
   ```
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/trifort
   JWT_SECRET=test-secret-key-at-least-32-characters-long-12345678
   NODE_ENV=development
   PORT=5000
   ```

3. **Initialize database with admin user**
   ```bash
   npm run init-db
   ```

4. **Start backend server**
   ```bash
   npm run dev
   ```

5. **Test login at** `http://localhost:5000/admin-login.html`

## Deployment Checklist

- [ ] Render environment variables configured (MONGO_URI, JWT_SECRET)
- [ ] Backend deployed to Render
- [ ] CORS whitelist includes Vercel domain
- [ ] MongoDB connection tested
- [ ] JWT_SECRET is 32+ characters and matches between environments
- [ ] Frontend admin-login.html points to correct Render URL
- [ ] Test login on production

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 500 Server Error | Check Render logs: missing MONGO_URI or JWT_SECRET |
| CORS Error in browser | Verify Vercel domain in corsOptions |
| "Invalid token" | Ensure same JWT_SECRET on Render as used for token creation |
| "Cannot find module bcrypt" | Delete node_modules, npm install (uses bcryptjs not bcrypt) |

## Files Modified

- ✅ [routes/auth.js](construction-website/backend/routes/auth.js) - Fixed bcrypt import
- ✅ [server.js](construction-website/backend/server.js) - Added CORS configuration
