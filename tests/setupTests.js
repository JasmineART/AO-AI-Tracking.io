import '@testing-library/jest-dom';

// Mock window.URL.createObjectURL used in DataGridView export
global.URL.createObjectURL = jest.fn(() => 'blob://test');

// Mock jsPDF save to avoid file download attempts in tests
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 }, getNumberOfPages: () => 1 },
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    splitTextToSize: jest.fn((text) => Array.isArray(text) ? text : [text]),
    autoTable: jest.fn(function () { this.lastAutoTable = { finalY: 80 }; }),
    save: jest.fn(),
    setPage: jest.fn(),
    getNumberOfPages: jest.fn(() => 1)
  }));
});

// Polyfill TextEncoder/TextDecoder for environments that lack them
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock uuid v4 to avoid ESM module issues in node_modules during Jest runs
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid')
}));
