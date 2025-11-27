# Hostinger Upload Guide - Files to Upload

## 📁 Files You Need to Upload

### ✅ **MUST UPLOAD (Essential Files)**

#### 1. **Root Directory Files** (Upload to `public_html/`)
These go directly in your website's root folder:

- ✅ `index.html` - **MAIN FILE** (Updated with all new features)
- ✅ `robots.txt` - SEO file
- ✅ `sitemap.xml` - SEO file

#### 2. **JavaScript Files** (Upload to `public_html/js/`)
- ✅ `js/app.js` - Main JavaScript (already exists, updated)
- ✅ `js/currency-converter.js` - **NEW FILE** (Currency conversion system)
- ✅ `js/python-bridge.js` - (if you're using it)

#### 3. **CSS Files** (Upload to `public_html/styles/`)
- ✅ `styles/main.css` - Main stylesheet (updated)
- ✅ `styles/hero-premium.css` - **NEW FILE** (Premium hero section styles)
- ✅ `styles/footer-premium.css` - **NEW FILE** (Premium footer styles)

#### 4. **Source Files** (Optional - Only if using build system)
If you're using the build system, you might have:
- `src/base.html`
- `src/partials/*.html` files

**BUT** since `index.html` is already complete, you don't need to upload these unless you're rebuilding.

---

## 📋 **Step-by-Step Upload Instructions**

### **Method 1: Using Hostinger File Manager (Easiest)**

1. **Log in to Hostinger**
   - Go to hPanel
   - Click **Files** → **File Manager**

2. **Navigate to `public_html` folder**
   - This is your website's root directory

3. **Upload Files:**

   **A. Upload `index.html`**
   - Click **Upload** button
   - Select `index.html` from your computer
   - **IMPORTANT:** If `index.html` already exists, replace it

   **B. Upload `robots.txt`**
   - Click **Upload**
   - Select `robots.txt`
   - Place in `public_html/` (root)

   **C. Upload `sitemap.xml`**
   - Click **Upload**
   - Select `sitemap.xml`
   - Place in `public_html/` (root)

   **D. Upload JavaScript Files**
   - Navigate to `public_html/js/` folder (create if doesn't exist)
   - Upload `js/currency-converter.js` (NEW FILE - IMPORTANT!)
   - Upload `js/app.js` (if updated)

   **E. Upload CSS Files**
   - Navigate to `public_html/styles/` folder
   - Upload `styles/main.css` (if updated)

---

### **Method 2: Using FTP (If you prefer)**

1. **Connect via FTP client** (FileZilla, WinSCP, etc.)
2. **Connect to:** `ftp.yourdomain.com` or your server IP
3. **Navigate to:** `/public_html/`
4. **Upload files** to these locations:

```
public_html/
├── index.html          ← Upload here
├── robots.txt          ← Upload here
├── sitemap.xml         ← Upload here
├── js/
│   ├── app.js          ← Upload here (if updated)
│   └── currency-converter.js  ← NEW! Upload here
└── styles/
    └── main.css        ← Upload here (if updated)
```

---

## 🎯 **Quick Checklist**

### **Critical Files (Must Upload):**
- [ ] `index.html` - **MOST IMPORTANT** (has all new features + premium design)
- [ ] `js/currency-converter.js` - **NEW FILE** (currency system won't work without this)
- [ ] `styles/hero-premium.css` - **NEW FILE** (premium hero section - REQUIRED!)
- [ ] `styles/footer-premium.css` - **NEW FILE** (premium footer - REQUIRED!)
- [ ] `robots.txt` - SEO file
- [ ] `sitemap.xml` - SEO file

### **Updated Files (Upload if changed):**
- [ ] `js/app.js` - (if you updated it)
- [ ] `styles/main.css` - (if you updated it)

### **Optional Files (Not needed if index.html is complete):**
- [ ] `src/partials/*.html` - (not needed, already in index.html)
- [ ] `src/base.html` - (not needed)

---

## ⚠️ **IMPORTANT NOTES**

### 1. **File Permissions**
After uploading, make sure:
- Files have **644** permissions (readable by web server)
- Folders have **755** permissions

### 2. **Backup First!**
- **BACKUP your current `index.html`** before replacing it
- Download current files from Hostinger first (just in case)

### 3. **File Locations**
```
✅ CORRECT:
public_html/index.html
public_html/js/currency-converter.js
public_html/robots.txt
public_html/sitemap.xml

❌ WRONG:
public_html/src/index.html (don't put in src folder)
public_html/index/index.html (don't create subfolders)
```

### 4. **Test After Upload**
After uploading:
1. Visit your website: `https://www.hiremediamind.com`
2. Check currency selector works
3. Test "Book a Call" button
4. Verify trust badges show
5. Check pricing updates with currency change

---

## 🚨 **Troubleshooting**

### Problem: Currency selector not working
**Solution:** Make sure `js/currency-converter.js` is uploaded to `public_html/js/`

### Problem: Book a Call modal not opening
**Solution:** Check browser console (F12) for errors. Make sure all JavaScript files are uploaded.

### Problem: Styles not loading
**Solution:** Check `styles/main.css` is in `public_html/styles/` folder

### Problem: 404 errors
**Solution:** Make sure files are in `public_html/` (root), not in subfolders

---

## 📦 **Complete File List**

Here's everything you need to upload:

```
📁 public_html/
  ├── 📄 index.html                    ← UPLOAD (Updated with premium design)
  ├── 📄 payment.html                  ← UPLOAD (NEW - Payment page)
  ├── 📄 robots.txt                    ← UPLOAD (New)
  ├── 📄 sitemap.xml                   ← UPLOAD (New)
  │
  ├── 📁 js/
  │   ├── 📄 app.js                    ← UPLOAD (If updated)
  │   ├── 📄 currency-converter.js     ← UPLOAD (NEW - CRITICAL!)
  │   └── 📄 python-bridge.js          ← UPLOAD (If exists)
  │
  └── 📁 styles/
      ├── 📄 main.css                  ← UPLOAD (If updated)
      ├── 📄 hero-premium.css          ← UPLOAD (NEW - REQUIRED!)
      └── 📄 footer-premium.css        ← UPLOAD (NEW - REQUIRED!)
```

---

## ✅ **After Upload - Verification**

1. **Visit your website:** `https://www.hiremediamind.com`
2. **Check these features:**
   - [ ] Currency selector appears in header
   - [ ] Changing currency updates prices
   - [ ] "Book a Call" button works
   - [ ] Trust badges show after hero section
   - [ ] Testimonials show international locations
   - [ ] Pricing shows in selected currency
   - [ ] FAQ accordion works
   - [ ] Mobile menu works

3. **Check browser console (F12):**
   - No red errors
   - Currency converter loads

---

## 🎉 **You're Done!**

Once you upload these files, your website will have:
- ✅ Currency conversion system
- ✅ Book a Call feature
- ✅ Trust badges
- ✅ International testimonials
- ✅ Professional design
- ✅ SEO files (robots.txt, sitemap.xml)

**Need help?** Let me know if you encounter any issues during upload!

