# 🚀 Quick Hostinger Setup Guide

## Database Name to Use
**`smpmuh35`** (will become `u541580780_smpmuh35`)

## Step 1: Create Database (2 minutes)
1. In Hostinger panel, go to **Databases → MySQL Databases**
2. Fill the form:
   - Database name: `smpmuh35`
   - Username: `smpmuh35`
   - Password: Create strong password (save it!)
3. Click **Create**

## Step 2: Configure Database (1 minute)
1. Open `public/api/config.local.php`
2. Replace `YOUR_PASSWORD_HERE` with your actual password
3. Save file

## Step 3: Import Tables (1 minute)
1. Click **Enter phpMyAdmin** in Hostinger
2. Select database `u541580780_smpmuh35`
3. Click **Import** tab
4. Upload `SETUP_DATABASE.sql` file
5. Click **Go**

## Step 4: Upload Files (FTP)
Upload to your Hostinger:
- `public/api/` folder
- `public/uploads/` folder (with .htaccess)

## Step 5: Test Backend
Visit: `https://peachpuff-porcupine-369154.hostingersite.com/api/gallery/list.php?published=1`

Should see:
```json
{"success":true,"message":"","data":{"items":[],...}}
```

## ✅ Done!
Dashboard will now work with MySQL database.
