# Quick Fix: Render Deployment Steps

## Immediate Actions Required

### Step 1: Set Render Environment Variables (CRITICAL)
Go to **Render Dashboard** → Your Web Service → **Environment** tab

Add these variables:
```
MONGO_URI=mongodb+srv://valeregatwiri_db_user:TbtbCr9sqRPj7T0b@trifortcluster.bvkvsby.mongodb.net/?appName=Trifortcluster
JWT_SECRET=your-super-secure-random-string-with-at-least-32-characters-1234567890ABCD
NODE_ENV=production
```

⚠️ **SECURITY WARNING**: Your MongoDB password is now visible. Consider rotating it in MongoDB Atlas after this is deployed.

Generate a strong JWT_SECRET (min 32 characters):
- Use: https://www.lastpass.com/features/password-generator
- Or in PowerShell: `[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | ForEach-Object { [char]$_ })))`

### Step 2: Deploy Updated Backend Code
```bash
# This adds the CORS fix + bcrypt fix
git add construction-website/backend/
git commit -m "Fix CORS and bcrypt import for login"
git push
```

Render will auto-deploy. Check your Render dashboard logs.

### Step 3: Verify Backend is Running
Open browser and test:
```
https://trifort-builders.onrender.com/api/health
```

Should return:
```json
{"status": "Server running", "timestamp": "...", "environment": "production"}
```

### Step 4: Verify MongoDB Connection
In browser console on admin-login.html:
```javascript
fetch('https://trifort-builders.onrender.com/api/health')
    .then(r => r.json())
    .then(console.log)
```

If this works, MongoDB is connected.

### Step 5: Test Login
1. Go to `https://your-vercel-domain.vercel.app/admin-login.html`
2. Use credentials:
   - Email: `admin@trifort.co.ke` (or what you set)
   - Password: (your admin password)

If still getting error, check Render logs in the Render dashboard.

## Debugging in Render Logs

Go to Render dashboard → Web Service → **Logs** tab

Look for:
- ✅ "✓ MongoDB connected successfully" - DB connection OK
- ❌ "Missing required environment variables" - Check MONGO_URI and JWT_SECRET
- ❌ "Invalid token" - JWT_SECRET mismatch

## If Login Still Fails

Check browser console (F12) → Network tab → admin-login.html login request

Look for error response details:
- 400 error = Missing email/password in request
- 401 error = Invalid credentials or password hashing issue
- 500 error = Server error (check Render logs)
- CORS error = Check corsOptions in server.js matches your domain

## MongoDB Atlas Quick Setup (if needed)

1. Go to [mongodb.com/cloud](https://www.mongodb.com/cloud)
2. Create free cluster
3. Get connection string: **Connect** → Copy connection string
4. Replace `<password>` and `<database>` in connection string
5. Use as `MONGO_URI` in Render environment

Format:
```
mongodb+srv://username:password@cluster-xyz.mongodb.net/trifort-builders
```

---

**Questions?** Check [DEPLOYMENT_FIXES.md](DEPLOYMENT_FIXES.md) for detailed info
