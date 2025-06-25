/**
 * Utility functions for CSV export
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with label and key properties
 * @returns {string} - CSV string
 */
export function objectsToCsv(data, headers) {
  if (!data || !data.length) return '';
  
  // Create header row
  const headerRow = headers.map(header => `"${header.label}"`).join(',');
  
  // Create data rows
  const rows = data.map(row => {
    return headers.map(header => {
      // Handle special cases like dates or objects
      let value = row[header.key];
      
      if (value === null || value === undefined) {
        return '""';
      }
      
      if (value instanceof Date) {
        value = value.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
      
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
}

/**
 * Download CSV data as file
 * @param {string} csvContent - CSV content to download
 * @param {string} fileName - Name of the file to download
 */
export function downloadCsv(csvContent, fileName) {
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Set link properties
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, fileName);
    return;
  }
  
  // For other browsers
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  
  // Append link to body, trigger click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
