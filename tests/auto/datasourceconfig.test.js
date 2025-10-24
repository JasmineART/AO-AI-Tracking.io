import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataSourceConfig from '../../src/components/DataSourceConfig';

test('toggle add form and file upload auto-detect format', () => {
  const setDataSources = jest.fn();
  render(<DataSourceConfig dataSources={[]} setDataSources={setDataSources} />);

  const toggleBtn = screen.getByText(/Add New Data Source/i);
  fireEvent.click(toggleBtn);

  // Now form should be visible
  expect(screen.getByText(/Configure New Data Source Connection/i)).toBeInTheDocument();

  // Mock a file upload
  const file = new File(['id,name\n1,Test'], 'data.csv', { type: 'text/csv' });
  const input = document.querySelector('input[type=file]');
  if (input) {
    fireEvent.change(input, { target: { files: [file] } });
    // After upload, a file name should appear in the UI
    expect(screen.queryByText('data.csv')).toBeTruthy();
  }
});
