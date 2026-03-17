/**
 * Utility to convert an array of objects to a CSV string and trigger a download.
 */
export const downloadAsCSV = (data: any[], filename: string) => {
  if (!data.length) return;

  // 1. Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // 2. Map headers to CSV row
  const csvRows = [];
  csvRows.push(headers.join(','));

  // 3. Map data to rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + val).replace(/"/g, '""'); // Escape double quotes
      return `"${escaped}"`; // Wrap in quotes to handle commas within values
    });
    csvRows.push(values.join(','));
  }

  // 4. Create Blob and download link
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
