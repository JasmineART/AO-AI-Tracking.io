import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { getProjectData } from '../utils/projectDataGenerator';

const DataGridView = ({ project }) => {
  const { success, error: showError, info } = useToast();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState(0);

  useEffect(() => {
    loadData();
  }, [project, selectedDataSource]);

  const loadData = () => {
    // Check if project has existing data
    if (project.gridData && project.gridData.rows && project.gridData.rows.length > 0) {
      // Load existing saved data
      setData(project.gridData.rows);
      setColumns(project.gridData.columns);
    } else {
      // Initialize empty grid with basic columns for new projects
      const defaultColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'value', label: 'Value' },
        { key: 'status', label: 'Status' },
        { key: 'date', label: 'Date' }
      ];
      setColumns(defaultColumns);
      setData([]); // Start with empty data array
    }
  };

  const handleCellEdit = (rowIndex, columnKey) => {
    setEditingCell({ rowIndex, columnKey });
    setEditValue(data[rowIndex][columnKey]);
  };

  const handleCellSave = () => {
    if (editingCell) {
      const newData = [...data];
      newData[editingCell.rowIndex][editingCell.columnKey] = editValue;
      setData(newData);
      setEditingCell(null);
      setEditValue('');
      info('Cell updated successfully');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[columnKey] < b[columnKey]) return direction === 'asc' ? -1 : 1;
      if (a[columnKey] > b[columnKey]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const handleAddRow = () => {
    const newRow = {};
    columns.forEach(col => {
      newRow[col.key] = '';
    });
    setData([...data, newRow]);
    success('New row added successfully');
  };

  const handleLoadSampleData = () => {
    if (data.length > 0) {
      const confirmLoad = window.confirm('This will replace existing data with sample data. Are you sure?');
      if (!confirmLoad) return;
    }
    
    // Get generated sample data for this project
    const projectData = getProjectData(project, selectedDataSource);
    setData(projectData.rows);
    setColumns(projectData.columns);
    success(`Loaded ${projectData.rows.length} sample rows successfully! 📊`);
  };

  const handleDeleteRow = (rowIndex) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
    success('Row deleted successfully');
  };

  const handleExport = () => {
    try {
      // Create CSV content
      const headers = columns.map(col => col.label).join(',');
      const rows = data.map(row => 
        columns.map(col => `"${row[col.key]}"`).join(',')
      ).join('\n');
      const csv = `${headers}\n${rows}`;

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}-data.csv`;
      a.click();
      
      success(`Exported ${data.length} rows to CSV successfully! 📊`);
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export data. Please try again.');
    }
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(filterText.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Data Source Selector */}
            {project.dataSources && project.dataSources.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Data Source:</label>
                <select
                  value={selectedDataSource}
                  onChange={(e) => setSelectedDataSource(Number(e.target.value))}
                  className="px-3 py-2 border-2 border-indigo-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {project.dataSources.map((source, idx) => (
                    <option key={idx} value={idx}>
                      {source.icon} {source.type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Filter */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <label className="text-sm font-semibold text-gray-700">🔍</label>
              <input
                type="text"
                placeholder="Filter data..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-indigo-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddRow}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
            >
              ➕ Add Row
            </button>
            {data.length === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                title="Load sample data to see how it works"
              >
                🎲 Load Sample Data
              </button>
            )}
            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
              disabled={data.length === 0}
            >
              📥 Export CSV
            </button>
            <button
              onClick={loadData}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Data Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <span className="font-semibold">
            📊 Total Rows: <span className="text-indigo-600">{data.length}</span>
          </span>
          <span className="font-semibold">
            📋 Columns: <span className="text-indigo-600">{columns.length}</span>
          </span>
          {filterText && (
            <span className="font-semibold">
              🔍 Filtered: <span className="text-indigo-600">{filteredData.length}</span>
            </span>
          )}
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">
                  #
                </th>
                {columns.map((col) => (
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
                ))}
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`${
                      rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-indigo-50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 border-r border-gray-200">
                      {rowIndex + 1}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm border-r border-gray-200"
                        onDoubleClick={() => handleCellEdit(rowIndex, col.key)}
                      >
                        {editingCell?.rowIndex === rowIndex && editingCell?.columnKey === col.key ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              className="flex-1 px-2 py-1 border-2 border-indigo-500 rounded focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={handleCellSave}
                              className="text-green-600 hover:text-green-800 font-bold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCellCancel}
                              className="text-red-600 hover:text-red-800 font-bold"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-900">{row[col.key]}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center border-gray-200">
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                        title="Delete row"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center">
                    {filterText ? (
                      <div className="text-gray-500">
                        <div className="text-4xl mb-2">🔍</div>
                        <p>No matching data found</p>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-lg font-semibold mb-2">No data yet - Start fresh!</p>
                        <p className="text-sm mb-4">Click "➕ Add Row" to add your first data entry</p>
                        <p className="text-xs text-gray-400">or use "🎲 Load Sample Data" to see an example</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Double-click any cell to edit its value. Click column headers to sort. Use the search box to filter data.
        </p>
      </div>
    </div>
  );
};

export default DataGridView;
