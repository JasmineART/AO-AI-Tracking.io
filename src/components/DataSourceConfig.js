import React, { useState } from 'react';

const DATA_SOURCE_TYPES = [
  { value: 'AWS', icon: '☁️', name: 'Amazon Web Services' },
  { value: 'Azure', icon: '🔷', name: 'Microsoft Azure' },
  { value: 'Google Sheets', icon: '📊', name: 'Google Sheets' },
  { value: 'Excel', icon: '📈', name: 'Microsoft Excel' },
  { value: 'Salesforce', icon: '☁️', name: 'Salesforce' },
  { value: 'PostgreSQL', icon: '🐘', name: 'PostgreSQL' },
  { value: 'MongoDB', icon: '🍃', name: 'MongoDB' },
  { value: 'MySQL', icon: '🐬', name: 'MySQL' },
  { value: 'Snowflake', icon: '❄️', name: 'Snowflake' },
  { value: 'Databricks', icon: '🧱', name: 'Databricks' },
  { value: 'Tableau', icon: '📊', name: 'Tableau' },
  { value: 'External API', icon: '🌐', name: 'External API' },
  { value: 'CSV/Excel', icon: '📄', name: 'CSV/Excel File' },
  { value: 'Data Lake/Warehouse', icon: '💾', name: 'Data Lake/Warehouse' },
  { value: 'Other', icon: '📦', name: 'Other' },
];

const AUTH_TYPES = [
  'None (Public/Local)',
  'Basic Login (User/Pass)',
  'API Key',
  'OAuth 2.0',
  'Token-Based',
  'Certificate',
  'SSO/SAML',
];

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const DataSourceConfig = ({ dataSources, setDataSources }) => {
  const [newSource, setNewSource] = useState({
    type: DATA_SOURCE_TYPES[0].value,
    authType: AUTH_TYPES[0],
    connectionDetailOrUrl: '',
    format: '',
    apiKey: '',
    username: '',
    password: '',
    fileName: '',
    fileSize: 0,
    fileType: '',
    fileData: null
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = React.createRef();

  const getDetailsPlaceholder = (type) => {
    switch (type) {
      case 'Google Sheets':
        return 'Enter Google Sheet URL (e.g., https://docs.google.com/spreadsheets/d/...)';
      case 'PostgreSQL':
      case 'MySQL':
        return 'Enter Host/Connection String (e.g., prod.db.com:5432)';
      case 'CSV/Excel':
        return 'Enter File Path or Storage URL (e.g., s3://bucket/data/file.csv)';
      case 'External API':
        return 'Enter API Endpoint URL (e.g., https://api.service.com/data/v1)';
      case 'AWS':
      case 'Azure':
        return 'Enter Cloud Resource URL or Identifier';
      case 'Salesforce':
        return 'Enter Salesforce Instance URL (e.g., https://yourorg.salesforce.com)';
      case 'MongoDB':
        return 'Enter MongoDB Connection String (e.g., mongodb://host:port/database)';
      case 'Snowflake':
      case 'Databricks':
      case 'Data Lake/Warehouse':
        return 'Enter Warehouse/Lake URL or Connection String';
      case 'Tableau':
        return 'Enter Tableau Server URL';
      default:
        return 'Enter Connection URL or Identifier';
    }
  };

  const handleAddSource = () => {
    if (!newSource.connectionDetailOrUrl || !newSource.format || !newSource.authType) {
      alert('Please fill in all required fields (Connection URL, Format, and Auth Type)');
      return;
    }

    const sourceToAdd = {
      ...newSource,
      id: Date.now() + Math.random(),
      icon: DATA_SOURCE_TYPES.find(s => s.value === newSource.type)?.icon || '📦'
    };

    setDataSources([...dataSources, sourceToAdd]);
    
    // Reset form
    setNewSource({
      type: DATA_SOURCE_TYPES[0].value,
      authType: AUTH_TYPES[0],
      connectionDetailOrUrl: '',
      format: '',
      apiKey: '',
      username: '',
      password: '',
      fileName: '',
      fileSize: 0,
      fileType: '',
      fileData: null
    });
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Close the form after adding
    setShowAddForm(false);
  };

  const handleRemoveSource = (id) => {
    setDataSources(dataSources.filter(source => source.id !== id));
  };

  const handleNewSourceChange = (e) => {
    setNewSource({ ...newSource, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type || file.name.split('.').pop();

    // Update the connection URL with file information
    const fileInfo = `local://${fileName}`;
    
    // Automatically detect format from file extension
    let detectedFormat = '';
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        detectedFormat = 'Excel';
        break;
      case 'csv':
        detectedFormat = 'CSV';
        break;
      case 'txt':
        detectedFormat = 'Text';
        break;
      case 'json':
        detectedFormat = 'JSON';
        break;
      case 'xml':
        detectedFormat = 'XML';
        break;
      case 'parquet':
        detectedFormat = 'Parquet';
        break;
      default:
        detectedFormat = extension.toUpperCase();
    }

    setUploadedFile({
      name: fileName,
      size: fileSize,
      type: fileType,
      file: file
    });

    setNewSource({
      ...newSource,
      connectionDetailOrUrl: fileInfo,
      format: detectedFormat,
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileType,
      type: 'CSV/Excel' // Auto-select appropriate type
    });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearFileUpload = () => {
    setUploadedFile(null);
    setNewSource({
      ...newSource,
      connectionDetailOrUrl: '',
      fileName: '',
      fileSize: 0,
      fileType: '',
      fileData: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-gray-700">
          🔌 Data Source Connections
          <span className="text-xs font-normal text-gray-500 ml-2">
            (Configure up to 10 data integrations)
          </span>
        </label>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {dataSources.length} / 10 Sources
        </span>
      </div>

      {/* Existing Data Sources List */}
      {dataSources.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3 border border-gray-200">
          {dataSources.map((source, index) => (
            <div
              key={source.id}
              className="flex items-start justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{source.icon}</span>
                  <span className="font-semibold text-gray-900 text-sm">{source.type}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {source.authType}
                  </span>
                  {source.fileName && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      📎 {source.fileName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate" title={source.connectionDetailOrUrl}>
                  📍 {source.connectionDetailOrUrl}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">
                    Format: {source.format}
                  </p>
                  {source.fileSize > 0 && (
                    <p className="text-xs text-gray-500">
                      • Size: {formatFileSize(source.fileSize)}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSource(source.id)}
                className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                aria-label="Remove data source"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Source Form */}
      {dataSources.length < 10 && (
        <div className="space-y-3">
          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 transform"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{showAddForm ? '➖' : '➕'}</span>
              {showAddForm ? 'Hide Add Source Form' : 'Add New Data Source'}
            </span>
            <span className="text-2xl">{showAddForm ? '▲' : '▼'}</span>
          </button>

          {/* Collapsible Form */}
          {showAddForm && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 md:p-4 border-2 border-indigo-200 space-y-3 animate-fadeInUp">
          <p className="text-sm font-bold text-indigo-900 flex items-center gap-2">
            🔌 Configure New Data Source Connection
          </p>

          {/* File Upload Section */}
          <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition-all">
            <div className="text-center">
              <div className="mb-3">
                <span className="text-4xl">📁</span>
              </div>
              <p className="text-sm font-bold text-gray-700 mb-2">
                Upload Local File
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Upload Excel, CSV, TXT, JSON, or XML files from your computer
              </p>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.xls,.xlsx,.json,.xml,.parquet"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {/* Upload Button or File Info */}
              {!uploadedFile ? (
                <button
                  type="button"
                  onClick={triggerFileUpload}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 transform flex items-center gap-2 mx-auto"
                >
                  <span className="text-xl">📤</span>
                  Choose File to Upload
                </button>
              ) : (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <div className="text-left">
                        <p className="text-sm font-bold text-green-900">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearFileUpload}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-indigo-300"></div>
            <span className="text-xs font-semibold text-indigo-600 bg-white px-3 py-1 rounded-full">
              OR Configure Manually
            </span>
            <div className="flex-1 border-t border-indigo-300"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Source Type */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                Data Source Type *
              </label>
              <select
                name="type"
                value={newSource.type}
                onChange={handleNewSourceChange}
                className="w-full px-3 py-2 md:py-3 rounded-lg border-2 border-gray-300 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {DATA_SOURCE_TYPES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth Type */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                Authentication Type *
              </label>
              <select
                name="authType"
                value={newSource.authType}
                onChange={handleNewSourceChange}
                className="w-full px-3 py-2 md:py-3 rounded-lg border-2 border-gray-300 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {AUTH_TYPES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Connection Detail/URL */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                Connection URL / Endpoint / Path *
              </label>
              <input
                type="text"
                name="connectionDetailOrUrl"
                placeholder={getDetailsPlaceholder(newSource.type)}
                value={newSource.connectionDetailOrUrl}
                onChange={handleNewSourceChange}
                className="w-full px-3 py-2 md:py-3 rounded-lg border-2 border-gray-300 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Format */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                Data Format *
              </label>
              <input
                type="text"
                name="format"
                placeholder="e.g., JSON, SQL, CSV, Parquet, XML"
                value={newSource.format}
                onChange={handleNewSourceChange}
                className="w-full px-3 py-2 md:py-3 rounded-lg border-2 border-gray-300 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Optional API Key */}
            {(newSource.authType === 'API Key' || newSource.authType === 'Token-Based') && (
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                  API Key / Token (Optional)
                </label>
                <input
                  type="password"
                  name="apiKey"
                  placeholder="Enter your API key or token"
                  value={newSource.apiKey}
                  onChange={handleNewSourceChange}
                  className="w-full px-3 py-2 md:py-3 rounded-lg border-2 border-gray-300 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            {/* Optional Username/Password */}
            {newSource.authType === 'Basic Login (User/Pass)' && (
              <>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                    Username (Optional)
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={newSource.username}
                    onChange={handleNewSourceChange}
                    className="w-full px-3 py-2 md:py-3 rounded-lg border-2 border-gray-300 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={newSource.password}
                    onChange={handleNewSourceChange}
                    className="w-full px-3 py-2 md:py-3 rounded-lg border-2 border-gray-300 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddSource}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➕ Add This Data Source
          </button>
        </div>
          )}
        </div>
      )}

      {dataSources.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-sm mb-2">🔌 No data sources configured yet</p>
          <p className="text-xs text-gray-400">Add your first data source connection above</p>
        </div>
      )}

      {dataSources.length >= 10 && (
        <div className="text-center py-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm font-semibold">
            ⚠️ Maximum of 10 data sources reached
          </p>
          <p className="text-xs text-yellow-600">Remove a source to add a new one</p>
        </div>
      )}
    </div>
  );
};

export default DataSourceConfig;
