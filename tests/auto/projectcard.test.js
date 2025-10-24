import React from 'react';
import { render, fireEvent } from '@testing-library/react';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

import ProjectCard from '../../src/components/ProjectCard';

test('ProjectCard calls navigate with project id on click', () => {
  const project = { id: 'proj-123', name: 'Test Project', type: 'AI System' };
  const { getByTestId } = render(<ProjectCard project={project} />);
  const card = getByTestId('project-card');
  fireEvent.click(card);
  expect(mockNavigate).toHaveBeenCalledWith('/project/proj-123');
});
