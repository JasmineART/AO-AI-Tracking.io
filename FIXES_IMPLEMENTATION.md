# Code Fixes - Implementation Guide

## Fix 1: Modal Accessibility (CRITICAL)
**File:** `src/pages/Projects.js`
**Location:** Around line 358

### Before:
```javascript
{showAddModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeInUp">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6">
        {editingProject ? 'Edit Project' : 'Create New Project'}
      </h2>
```

### After:
```javascript
{showAddModal && (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeInUp"
    role="dialog"
    aria-modal="true"
    aria-labelledby="project-modal-title"
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        resetForm();
      }
    }}
  >
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 id="project-modal-title" className="text-3xl font-bold">
          {editingProject ? 'Edit Project' : 'Create New Project'}
        </h2>
        <button
          onClick={resetForm}
          aria-label="Close modal"
          className="text-2xl text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ×
        </button>
      </div>
```

---

## Fix 2: Remove Duplicate Mobile Menu (HIGH)
**File:** `src/components/Navbar.js`
**Issue:** Two mobile menu implementations

### Action: Delete the portal version (lines 54-145)

Keep ONLY the inline version at lines 261-290:
```javascript
{/* Mobile Navigation (overlay when open) */}
{currentUser && menuOpen && (
  <div
    id="mobile-menu"
    className="fixed inset-0 md:hidden bg-white dark:bg-gray-900 z-[9999]"
  >
    {/* Keep this version, delete the portal version above */}
  </div>
)}
```

Remove this entire block (lines 54-145):
```javascript
// DELETE THIS - it's duplicate
const mobileMenuPortal = (currentUser && menuOpen && typeof document !== 'undefined')
  ? createPortal(...)
  : null;

// and later:
<div className="flex justify-between">{mobileMenuPortal}</div>
```

---

## Fix 3: Standardize Z-Index (HIGH)
**Create:** `src/utils/zIndexLayers.js` (NEW FILE)

```javascript
/**
 * Centralized z-index management
 * Prevents stacking context collisions
 */
export const Z_INDEX = {
  // Modals and overlays
  MODAL_BACKDROP: 40,
  MODAL: 41,
  
  // Navigation
  NAVBAR: 50,
  
  // Notifications
  TOAST: 70,  // Highest - should float above everything
};

export default Z_INDEX;
```

Then update files:

**File:** `src/components/Navbar.js` (Line 72)
```javascript
// Before:
style={{ zIndex: 99999, pointerEvents: 'auto' }}

// After:
style={{ zIndex: Z_INDEX.NAVBAR, pointerEvents: 'auto' }}
```

**File:** `src/components/ToastContainer.js` (Line 101)
```javascript
// Before:
<div className="fixed top-4 right-4 z-[9999]">

// After:
import Z_INDEX from '../utils/zIndexLayers';

<div className={`fixed top-4 right-4 z-[${Z_INDEX.TOAST}] flex flex-col gap-3 pointer-events-none`}>
  {/* or use inline style as fallback */}
  <div style={{ zIndex: Z_INDEX.TOAST }}>
```

---

## Fix 4: Form Label Association (HIGH)
**File:** `src/components/DataGridView.js` (Line 142)

### Before:
```javascript
<label className="text-sm font-semibold text-gray-700">Data Source:</label>
<select
  value={selectedDataSource}
  onChange={(e) => setSelectedDataSource(Number(e.target.value))}
  className="px-3 py-2 border-2 border-indigo-300 rounded-lg text-sm"
>
```

### After:
```javascript
<div className="flex flex-col gap-2">
  <label htmlFor="data-source-select" className="text-sm font-semibold text-gray-700">
    Data Source:
  </label>
  <select
    id="data-source-select"
    value={selectedDataSource}
    onChange={(e) => setSelectedDataSource(Number(e.target.value))}
    className="px-3 py-2 border-2 border-indigo-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    aria-label="Select data source for this project"
  >
```

---

## Fix 5: Button Accessibility - Delete Row (HIGH)
**File:** `src/components/DataGridView.js` (Line 300)

### Before:
```javascript
<button
  onClick={() => handleDeleteRow(rowIndex)}
  className="text-red-500 hover:text-red-700 font-bold text-lg"
  title="Delete row"
>
  🗑️
</button>
```

### After:
```javascript
<button
  onClick={() => handleDeleteRow(rowIndex)}
  aria-label={`Delete row ${rowIndex + 1}`}
  className="text-red-500 hover:text-red-700 font-bold text-lg p-2 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
  type="button"
  title="Delete this row (Keyboard: Delete when row is selected)"
>
  🗑️ <span className="sr-only">Delete</span>
</button>
```

---

## Fix 6: Data Grid Mobile Responsiveness (HIGH)
**File:** `src/components/DataGridView.js` (Line 221)

### Before:
```javascript
<div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
```

### After:
```javascript
<div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
  {/* Mobile-friendly responsive table */}
  <div className="overflow-x-auto md:overflow-x-visible">
    <table className="w-full border-collapse text-xs md:text-sm">
      <thead>
        <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">
            #
          </th>
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500 cursor-pointer hover:bg-indigo-700 transition-colors hidden md:table-cell"
            >
              {/* Hide less important columns on mobile */}
```

**Also update table cells:**
```javascript
{columns.map((col) => (
  <td
    key={col.key}
    className="px-2 md:px-4 py-1 md:py-3 text-xs md:text-sm border-r border-gray-200 hidden md:table-cell"
  >
```

---

## Fix 7: Image Alt Text (HIGH)
**File:** `src/pages/Profile.js` (Line 89)

### Before:
```javascript
<img
  src={currentUser.photoURL}
  alt="Profile"
  className="w-28 h-28 rounded-2xl border-4 border-indigo-200 shadow-xl transform hover:scale-110 transition-transform duration-300"
/>
```

### After:
```javascript
<img
  src={currentUser.photoURL}
  alt={`${currentUser.displayName || 'User'} profile picture`}
  className="w-28 h-28 rounded-2xl border-4 border-indigo-200 shadow-xl transform hover:scale-110 transition-transform duration-300"
  loading="lazy"
/>
```

---

## Fix 8: Mobile Stats Section (MEDIUM)
**File:** `src/pages/Home.js` (Line 116)

### Before:
```javascript
<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
  {[
    { value: '10+', label: 'Data Sources' },
    // ...
  ].map((stat, idx) => (
    <div key={idx} className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scaleIn" style={{animationDelay: `${idx * 0.1}s`}}>
      <div className="text-4xl font-extrabold mb-2">{stat.value}</div>
      <div className="text-sm opacity-90">{stat.label}</div>
    </div>
  ))}
</div>
```

### After:
```javascript
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-16">
  {[
    { value: '10+', label: 'Data Sources' },
    // ...
  ].map((stat, idx) => (
    <div 
      key={idx} 
      className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 md:p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scaleIn" 
      style={{animationDelay: `${idx * 0.1}s`}}
    >
      <div className="text-2xl md:text-4xl font-extrabold mb-2">{stat.value}</div>
      <div className="text-xs md:text-sm opacity-90">{stat.label}</div>
    </div>
  ))}
</div>
```

---

## Fix 9: Password Field Accessibility (MEDIUM)
**File:** `src/pages/Login.js` (Around line 270)

### Add a new state:
```javascript
const [showPassword, setShowPassword] = useState(false);
```

### Before:
```javascript
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Password
  </label>
  <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    minLength="6"
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
    placeholder="••••••••"
  />
</div>
```

### After:
```javascript
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      minLength="6"
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white pr-12"
      placeholder="••••••••"
      autoComplete="current-password"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
    >
      {showPassword ? '🙈 Hide' : '👁️ Show'}
    </button>
  </div>
</div>
```

---

## Fix 10: Sortable Table Headers Accessibility (MEDIUM)
**File:** `src/components/DataGridView.js` (Line 236)

### Before:
```javascript
<th
  key={col.key}
  onClick={() => handleSort(col.key)}
  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500 cursor-pointer hover:bg-indigo-700 transition-colors"
>
  <div className="flex items-center gap-2">
    {col.label}
    {sortConfig.key === col.key && (
      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
    )}
  </div>
</th>
```

### After:
```javascript
<th
  key={col.key}
  onClick={() => handleSort(col.key)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(col.key);
    }
  }}
  role="columnheader"
  aria-sort={
    sortConfig.key === col.key 
      ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending')
      : 'none'
  }
  tabIndex="0"
  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500 cursor-pointer hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
>
  <div className="flex items-center gap-2">
    {col.label}
    {sortConfig.key === col.key && (
      <span aria-label={`Sorted ${sortConfig.direction === 'asc' ? 'ascending' : 'descending'}`}>
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )}
  </div>
</th>
```

---

## Fix 11: Header Button Mobile Overflow (MEDIUM)
**File:** `src/pages/Projects.js` (Line 184)

### Before:
```javascript
<div className="flex gap-3 items-center">
  <AdminThemeToggle />
  <button
    onClick={handleExportPDF}
    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 transform flex items-center gap-2"
    title="Export Projects to PDF"
  >
    📄 Export PDF
  </button>
  <button
    onClick={() => setShowAddModal(true)}
    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 transform flex items-center gap-2"
  >
    ➕ Create Project
  </button>
</div>
```

### After:
```javascript
<div className="flex gap-2 md:gap-3 items-center flex-wrap md:flex-nowrap">
  <AdminThemeToggle />
  <button
    onClick={handleExportPDF}
    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base hover:shadow-2xl hover:scale-105 transition-all duration-300 transform flex items-center gap-1 md:gap-2 whitespace-nowrap"
    title="Export Projects to PDF"
  >
    📄 <span className="hidden md:inline">Export PDF</span>
  </button>
  <button
    onClick={() => setShowAddModal(true)}
    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base hover:shadow-2xl hover:scale-105 transition-all duration-300 transform flex items-center gap-1 md:gap-2 whitespace-nowrap"
  >
    ➕ <span className="hidden md:inline">Create</span>
  </button>
</div>
```

---

## Installation Order:
1. **Fix 1 & 3:** Modal & Z-index (Critical)
2. **Fix 2:** Remove duplicate menu
3. **Fix 4-7:** Form accessibility & images
4. **Fix 8-11:** Mobile & medium fixes

---

## Testing Checklist:
- [ ] Modal escape key closes it
- [ ] Toast appears above mobile menu
- [ ] No duplicate mobile menus visible
- [ ] All form inputs can be accessed by Tab key
- [ ] Images display properly
- [ ] Button labels readable on mobile
- [ ] Table data readable on mobile screens
- [ ] Keyboard navigation works throughout app
- [ ] Screen reader reads labels correctly
