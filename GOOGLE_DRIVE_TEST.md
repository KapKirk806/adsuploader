# Google Drive Integration - Test Guide

## ✅ Google Drive Integration Complete!

Your Google credentials have been configured in the `.env` file.

Check `backend/.env` to see your:
- **Client ID**
- **Client Secret**
- **Redirect URI**: `http://localhost:5000/api/google-drive/callback`

---

## 🔧 Google Cloud Console Setup (REQUIRED FIRST!)

### Step 1: Add Authorized Redirect URI

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, click **+ ADD URI**
4. Add exactly: `http://localhost:5000/api/google-drive/callback`
5. Click **SAVE**

### Step 2: Configure OAuth Consent Screen (if needed)

1. Go to **OAuth consent screen** in left sidebar
2. If status is "Testing", add your email to **Test users**
3. Click **SAVE**

---

## 🚀 Quick Test

### Test the Google Drive connection:

```bash
# Start the backend (in backend directory)
npm run dev

# In another terminal, test the connection:
curl http://localhost:5000/api/google-drive/status \
  -H "Authorization: Bearer test-token"

# Should return: {"connected":false}

# Get OAuth URL:
curl http://localhost:5000/api/google-drive/connect \
  -H "Authorization: Bearer test-token"

# Copy the authUrl and open it in your browser
# Complete the Google sign-in
# You'll be redirected back (may show error if frontend isn't running, but that's OK!)

# Check connection again:
curl http://localhost:5000/api/google-drive/status \
  -H "Authorization: Bearer test-token"

# Should return: {"connected":true,"email":"your-email@gmail.com"}

# List your Google Drive files:
curl http://localhost:5000/api/google-drive/files \
  -H "Authorization: Bearer test-token"

# Should return your images and videos from Google Drive!
```

---

## ✅ That's It!

Google Drive integration is working if:
- ✅ You can connect via OAuth
- ✅ Status shows "connected: true"
- ✅ You can see your Drive files

**Full testing guide is in the project!**
