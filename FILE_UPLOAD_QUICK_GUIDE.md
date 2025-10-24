# 📤 Quick Guide: How to Upload Files for Data Sources

## Super Simple 3-Step Process

### Step 1: Open the Project Form
- Go to **Projects** page
- Click **"+ Add New Project"** (or Edit an existing project)
- Fill in basic info (name, owner, department, etc.)
- Scroll to **"🔌 Data Source Connections"** section

### Step 2: Upload Your File
You'll see a **file upload box** that looks like this:

```
┌────────────────────────────────────────┐
│             📁                         │
│      Upload Local File                 │
│  Upload Excel, CSV, TXT, JSON, or XML  │
│                                        │
│   [📤 Choose File to Upload]          │
└────────────────────────────────────────┘
```

**Click the blue "📤 Choose File to Upload" button**

A file browser window will pop up - just like when you attach files to email!

**Select your file:**
- ✅ Excel files (.xlsx, .xls)
- ✅ CSV files (.csv)
- ✅ Text files (.txt)
- ✅ JSON files (.json)
- ✅ XML files (.xml)
- ✅ Parquet files (.parquet)

### Step 3: Confirm and Add

After selecting a file, you'll see:

```
┌────────────────────────────────────────┐
│  ✅  your-file.xlsx                    │
│      1.5 MB               [Remove]     │
└────────────────────────────────────────┘
```

The system automatically fills in:
- ✅ **File name** - shown with checkmark
- ✅ **File size** - in KB, MB, or GB
- ✅ **Connection path** - `local://your-file.xlsx`
- ✅ **Format** - detected from extension (Excel, CSV, Text, etc.)
- ✅ **Data source type** - set to CSV/Excel

**Just click "➕ Add This Data Source"** and you're done!

## What If I Made a Mistake?

**Easy! Just click the "Remove" button** next to your uploaded file, and you can:
- Upload a different file
- Or manually enter connection details below

## Can I Add Multiple Files?

**Yes!** After adding your first file as a data source:
1. The form resets
2. Upload another file
3. Add it as a second data source
4. Repeat up to 10 times (10 data sources per project)

## Alternative: Manual Entry

Don't have a file to upload? **No problem!**

Below the file upload area, you'll see:

```
─────── OR Configure Manually ───────
```

Use the fields below to manually enter:
- Data Source Type (AWS, Azure, PostgreSQL, etc.)
- Authentication Type
- Connection URL
- Data Format
- Credentials (if needed)

## Example: Marketing Team Scenario

**Sarah wants to add her campaign results:**

1. **Opens project form** ✓
2. **Clicks "Choose File to Upload"** ✓
3. **Selects "Q4-Campaign-Results.xlsx" from her Downloads folder** ✓
4. **Sees**: 
   - ✅ Q4-Campaign-Results.xlsx
   - 856 KB
5. **Clicks "Add This Data Source"** ✓
6. **File appears in data source list**:
   ```
   📈 CSV/Excel [None (Public/Local)] 📎 Q4-Campaign-Results.xlsx
   📍 local://Q4-Campaign-Results.xlsx
   Format: Excel • Size: 856 KB
   ```
7. **Saves the project** ✓

**Total time: Less than 30 seconds!** 🎉

## Tips for Success

### ✅ Do's
- **Use descriptive file names** - easier to identify later
- **Keep files under 10 MB** for best performance
- **Upload the latest version** of your data files
- **Check the file format** is correct after upload

### ❌ Don'ts
- **Don't upload sensitive files** without proper security measures
- **Don't upload corrupted files** - validate them first
- **Don't use special characters** in file names (stick to letters, numbers, dashes, underscores)

## Where Are My Files Stored?

**Currently:** File information (name, size, type) is stored in the project data. The actual file remains on your local computer.

**Note:** This is a metadata reference system. For production use, files should be uploaded to secure cloud storage.

## What You'll See in Your Project

When you view your project card, data sources with files show:
- **File icon badge** 📎 with file name
- **First 3 sources** displayed as colored badges
- **"+X more"** if you have more than 3 sources

**Example:**
```
┌─────────────────────────────────────────┐
│  Customer Analytics Project            │
│  ─────────────────────────────────     │
│  Data Sources:                         │
│  [📈 CSV/Excel] [📎 sales.xlsx]        │
│  [🐘 PostgreSQL] [🍃 MongoDB]          │
│  [+2 more]                             │
└─────────────────────────────────────────┘
```

## Troubleshooting

**Q: The "Choose File" button isn't working**
- **A:** Make sure you're using a modern browser (Chrome, Firefox, Edge, Safari)
- Try refreshing the page

**Q: My file isn't showing the right format**
- **A:** The format is auto-detected from the file extension
- You can manually change it after upload in the form fields

**Q: Can I upload files larger than 10 MB?**
- **A:** Yes, but very large files may take longer to process
- For production use, consider uploading to cloud storage first

**Q: The "Add This Data Source" button is disabled**
- **A:** Make sure all required fields are filled:
  - Connection URL (auto-filled from file upload)
  - Data Format (auto-filled from file extension)
  - Authentication Type (defaults to "None")

**Q: I accidentally uploaded the wrong file**
- **A:** Click the "Remove" button and upload the correct file

## Need More Help?

- 📖 **See full documentation:** FILE_UPLOAD_FEATURE.md
- 📖 **Data integration guide:** DATA_SOURCE_INTEGRATION_ENHANCEMENT.md
- 📖 **User guide:** DATA_SOURCE_USER_GUIDE.md

---

**Remember:** The file upload is designed to be **simple and intuitive**. If you can attach a file to an email, you can use this feature! 🚀
