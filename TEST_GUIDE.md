# 🧪 REAL TEST GUIDE - Let's Verify Everything Works!

## ✅ What We Have Now

**Meta API Credentials** (REAL MODE - No more mocks!):
- App ID: `1257077933002853`
- Secret: `680cd9e842cedf9c491156eb164088c0`
- Permissions: ✅ Granted

**Google Drive Credentials**:
- Configured in `backend/.env`
- Ready for OAuth flow

---

## 🚀 Run The Automated Test Suite

I've created a test script that will verify everything works!

### Step 1: Start the backend

```bash
cd backend
npm run dev
```

Wait for:
```
✅ Database connected successfully
✅ Redis connected successfully
🚀 Server running on port 5000
```

### Step 2: Run the test suite (in a new terminal)

```bash
cd backend
npm run test:integration
```

This will:
1. ✅ Check server health
2. ✅ Verify Meta API credentials loaded
3. ✅ Check Google Drive connection
4. ✅ Offer to connect Google Drive (if not connected)
5. ✅ List files from Google Drive
6. ✅ Test all API endpoints

---

## 🔧 Before Testing - Google Cloud Console Setup

**REQUIRED**: Add the redirect URI to Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:5000/api/google-drive/callback
   ```
4. Click **SAVE**

---

## 📝 Manual Test Commands

If you want to test manually:

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

Expected: `{"status":"healthy",...}`

### Test 2: Google Drive Status
```bash
curl http://localhost:5000/api/google-drive/status \
  -H "Authorization: Bearer test-token"
```

Expected: `{"connected":false}` (or `true` if already connected)

### Test 3: Get Google OAuth URL
```bash
curl http://localhost:5000/api/google-drive/connect \
  -H "Authorization: Bearer test-token"
```

Expected: `{"authUrl":"https://accounts.google.com/o/oauth2/v2/auth?..."}`

Copy the `authUrl` and open it in your browser, sign in with Google, grant permissions.

### Test 4: List Google Drive Files
```bash
curl http://localhost:5000/api/google-drive/files \
  -H "Authorization: Bearer test-token"
```

Expected: `{"files":[...],"nextPageToken":"..."}`

---

## 🎯 What The Tests Will Prove

✅ **Server is running and healthy**
✅ **Database connection works**
✅ **Redis connection works**
✅ **Meta API credentials loaded (REAL MODE)**
✅ **Google Drive OAuth flow works**
✅ **Can list files from Google Drive**
✅ **All API endpoints respond correctly**

---

## 🐛 If Something Fails

### "Connection refused" or "ECONNREFUSED"
**Problem**: Server not running
**Solution**: Make sure you ran `npm run dev` in backend directory

### "redirect_uri_mismatch"
**Problem**: Google Cloud Console not configured
**Solution**: Add the exact redirect URI to Google Cloud Console (see above)

### "Database query error"
**Problem**: PostgreSQL not running or database not created
**Solution**:
```bash
# Check if PostgreSQL is running
psql -d adsuploader -c "SELECT 1"

# If not, create the database
createdb adsuploader
psql -d adsuploader -f migrations/001_initial_schema.sql
```

### "Redis connection error"
**Problem**: Redis not running
**Solution**:
```bash
# Start Redis
redis-server

# Or check if it's running
redis-cli ping
# Should return: PONG
```

---

## ✅ Success Looks Like:

```
=== AdsUploader Integration Tests ===

✅ Server is healthy
✅ Meta API credentials configured - REAL MODE
   App ID: 1257077933002853
✅ Google Drive connected: your-email@gmail.com
✅ Found 15 files in Google Drive
   First 3 files:
     1. photo1.jpg (image/jpeg)
     2. video1.mp4 (video/mp4)
     3. banner_v1.png (image/png)
✅ Found 0 templates
✅ Found 0 jobs

=== Tests Complete ===

✅ All basic tests passed!
```

---

## 🎉 Ready to Test!

Run:
```bash
cd backend
npm run test:integration
```

Let me know what happens! 🚀
