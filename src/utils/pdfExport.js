import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportDashboardToPDF = (dashboardData, filename = 'dashboard-report.pdf') => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.text('OA AI Tracker - Dashboard Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
    
    // Summary Metrics
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Key Metrics', 14, 40);
    
    doc.autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Overall Readiness Score', `${dashboardData.overallReadiness}%`],
        ['Total Projects', dashboardData.totalProjects],
        ['Active Projects', dashboardData.activeProjects],
        ['Completed Projects', dashboardData.completedProjects],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14 },
    });
    
    // Department Performance
    if (dashboardData.departments && dashboardData.departments.length > 0) {
      const finalY = doc.lastAutoTable.finalY || 45;
      doc.setFontSize(16);
      doc.text('Department Performance', 14, finalY + 15);
      
      doc.autoTable({
        startY: finalY + 20,
        head: [['Department', 'Projects', 'Avg Readiness']],
        body: dashboardData.departments.map(dept => [
          dept.name,
          dept.projects,
          `${dept.avgReadiness}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14 },
      });
    }
    
    // AI Insights
    if (dashboardData.insights) {
      const finalY = doc.lastAutoTable.finalY || 45;
      doc.setFontSize(16);
      doc.text('AI Insights', 14, finalY + 15);
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const insights = dashboardData.insights.summary || 'No insights available';
      const splitInsights = doc.splitTextToSize(insights, pageWidth - 28);
      doc.text(splitInsights, 14, finalY + 22);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | OA AI Tracker`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const exportProjectsToPDF = (projects, filename = 'projects-report.pdf') => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229);
    doc.text('OA AI Tracker - Projects Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Projects: ${projects.length}`, 14, 40);
    
    // Projects Table
    doc.autoTable({
      startY: 48,
      head: [['Name', 'Type', 'Status', 'Owner', 'Readiness']],
      body: projects.map(project => [
        project.name,
        project.type,
        project.status,
        project.owner,
        `${project.readinessScore}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 },
      },
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | OA AI Tracker`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const exportProjectDetailToPDF = (project, tableData, filename) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text(project.name, pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
    
    // Project Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Project Details', 14, 40);
    
    doc.autoTable({
      startY: 45,
      head: [['Property', 'Value']],
      body: [
        ['Type', project.type],
        ['Status', project.status],
        ['Owner', project.owner],
        ['Department', project.department],
        ['Readiness Score', `${project.readinessScore}%`],
        ['Data Sources', (project.dataSources || []).length],
      ],
      theme: 'plain',
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14 },
    });
    
    // Data Table
    if (tableData && tableData.length > 0) {
      const finalY = doc.lastAutoTable.finalY || 45;
      doc.setFontSize(12);
      doc.text('Project Data', 14, finalY + 15);
      
      const columns = Object.keys(tableData[0]);
      const rows = tableData.map(row => columns.map(col => row[col]));
      
      doc.autoTable({
        startY: finalY + 20,
        head: [columns],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | OA AI Tracker`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(filename || `${project.name}-details.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
