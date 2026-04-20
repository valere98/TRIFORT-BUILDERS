# Render Deployment - Final Checklist

## Your Actual Configuration

```
Backend: https://trifort-builders.onrender.com
Database: mongodb+srv://valeregatwiri_db_user:TbtbCr9sqRPj7T0b@trifortcluster.bvkvsby.mongodb.net/?appName=Trifortcluster
Frontend: Vercel or localhost
```

## ✅ Code Fixes Applied

- [x] Fixed bcrypt import in `auth.js` (now uses `bcryptjs`)
- [x] Added CORS whitelist in `server.js` (includes Vercel + localhost)
- [x] Email validation and password hashing logic intact

## 🚀 IMMEDIATE STEPS - Do These Now

### 1. Update Render Environment Variables
**Go to:** Render Dashboard → Your Web Service → **Environment** tab

**Set these variables:**

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://valeregatwiri_db_user:TbtbCr9sqRPj7T0b@trifortcluster.bvkvsby.mongodb.net/?appName=Trifortcluster` |
| `JWT_SECRET` | Generate a random string (32+ chars) |
| `NODE_ENV` | `production` |

**To generate JWT_SECRET**, run in PowerShell:
```powershell
-join ([char[]](0..9) + [char[]](97..122) | Get-Random -Count 32)
```

Example: `aB7xCd9eF2gH4iJ6kL8mN0oP1qR3sT5uV`

### 2. Deploy Updated Code
```bash
git add construction-website/backend/
git commit -m "Fix: bcrypt import and CORS for Vercel frontend"
git push
```

Watch your Render logs for deployment success.

### 3. Verify Backend Health
Open in browser:
```
https://trifort-builders.onrender.com/api/health
```

You should see:
```json
{
    "status": "Server running",
    "timestamp": "2026-04-16T...",
    "environment": "production"
}
```

**If you get "Missing required environment variables"** → Go back to Step 1 and verify MONGO_URI and JWT_SECRET are set.

### 4. Test Login Locally First

**If testing on localhost:**
1. Create `.env` file in project root:
   ```
   MONGO_URI=mongodb+srv://valeregatwiri_db_user:TbtbCr9sqRPj7T0b@trifortcluster.bvkvsby.mongodb.net/?appName=Trifortcluster
   JWT_SECRET=your-test-secret-key-min-32-characters-long-1234
   NODE_ENV=development
   PORT=5000
   ```

2. Start backend:
   ```bash
   npm install
   npm run init-db
   npm run dev
   ```

3. Open: `http://localhost:5000/admin-login.html`

4. Login with:
   - Email: `admin@trifort.co.ke`
   - Password: (whatever you set during init-db)

### 5. Test on Vercel Production

Once localhost works, test on your live Vercel domain:
```
https://your-vercel-domain.vercel.app/admin-login.html
```

## 🔍 Debugging Tips

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| "Cannot find module bcrypt" | Wrong package | Run `npm install` then redeploy |
| CORS error in browser | Domain not in whitelist | Check `corsOptions` in server.js |
| "Invalid token" | JWT_SECRET mismatch | Same JWT_SECRET must be on Render |
| 500 Server Error | Missing env vars | Check Render logs for errors |
| "Invalid email or password" | Wrong credentials | Verify admin user exists in DB |

### Check Render Logs

**Render Dashboard → Logs tab** - Look for:
```
✓ MongoDB connected successfully     ← Good!
✗ Missing required environment variables ← Bad! Set MONGO_URI and JWT_SECRET
```

## ⚠️ Security Notes

Your MongoDB password is now in environment variables. This is secure on Render (encrypted), but consider:
1. Never commit `.env` to Git
2. Rotate your MongoDB password in MongoDB Atlas after confirming it works
3. Use different JWT_SECRET for production vs development

## Need Help?

If login still fails after these steps:
1. Check Render logs (actual error messages)
2. Run health check: `https://trifort-builders.onrender.com/api/health`
3. Verify MONGO_URI connects: Can you access MongoDB Atlas from Render?
4. Check browser console (F12) for CORS or network errors
