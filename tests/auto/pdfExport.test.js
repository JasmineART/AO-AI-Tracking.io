import { exportDashboardToPDF, exportProjectsToPDF, exportProjectDetailToPDF } from '../../src/utils/pdfExport';

test('exportDashboardToPDF returns true with valid data', () => {
  const data = {
    overallReadiness: 80,
    totalProjects: 3,
    activeProjects: 2,
    completedProjects: 1,
    departments: [{ name: 'Ops', projects: 1, avgReadiness: 80 }],
    insights: { summary: 'All good' }
  };

  expect(exportDashboardToPDF(data)).toBe(true);
});

test('exportProjectsToPDF returns true given projects array', () => {
  const projects = [{ name: 'P1', type: 'AI', status: 'Planning', owner: 'A', readinessScore: 60 }];
  expect(exportProjectsToPDF(projects)).toBe(true);
});

test('exportProjectDetailToPDF returns true with project and table data', () => {
  const project = { name: 'P1', type: 'AI', status: 'Planning', owner: 'A', department: 'Ops', readinessScore: 60, dataSources: [] };
  const tableData = [{ id: 1, value: 'x' }];
  expect(exportProjectDetailToPDF(project, tableData)).toBe(true);
});
