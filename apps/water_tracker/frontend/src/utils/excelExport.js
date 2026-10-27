import * as XLSX from 'xlsx-js-style';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects representing table rows
 * @param {string} filename - Base filename (without extension)
 * @param {string} sheetName - Name of the Excel sheet
 * @param {string} title - Report title (optional)
 * @param {string} dateRange - Date range text (optional)
 * @param {Array} summaryData - Array of arrays for summary section (optional)
 */
export const exportToExcel = (data, filename, sheetName = 'Sheet1', title = '', dateRange = '', summaryData = []) => {
    try {
        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Prepare data with title, date range, and summary if provided
        let wsData = [];

        if (title) {
            wsData.push([{ v: title, t: "s", s: { font: { bold: true, sz: 14, color: { rgb: "1E3A8A" } }, alignment: { horizontal: "center" } } }]);
            wsData.push([]); // Empty row
        }

        if (dateRange) {
            wsData.push([{ v: dateRange, t: "s", s: { font: { italic: true, color: { rgb: "4B5563" } } } }]);
            wsData.push([]); // Empty row
        }

        if (summaryData && summaryData.length > 0) {
            wsData = wsData.concat(summaryData);
            wsData.push([]); // Empty row after summary
        }

        // Convert data to worksheet format first to extract headers easily
        // cellDates: true ensures JS Date objects are treated as Excel Dates
        const dataWs = XLSX.utils.json_to_sheet(data, { cellDates: true });
        const dataArray = XLSX.utils.sheet_to_json(dataWs, { header: 1 });

        // Apply stylish colors to the header row
        if (dataArray.length > 0) {
            dataArray[0] = dataArray[0].map(headerText => ({
                v: headerText,
                t: "s",
                s: {
                    fill: { fgColor: { rgb: "2563EB" } }, // Nice tailwind Blue-600 background
                    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
                    alignment: { horizontal: "center", vertical: "center" }
                }
            }));
        }

        // Record the start row of the table for autofilter
        const tableStartRow = wsData.length;

        // Combine all sections
        wsData = wsData.concat(dataArray);

        // Create the final worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData, { cellDates: true });

        // Format dates correctly to 'dd-mm-yyyy'
        for (const cellAddress in ws) {
            if (cellAddress.startsWith('!')) continue;
            const cell = ws[cellAddress];
            // 'd' means Date type in SheetJS (with cellDates: true)
            // 'n' might also be used for dates in some cases, but 'd' is standard here
            if (cell.t === 'd' || cell.v instanceof Date) {
                cell.z = "dd-mm-yyyy";
            }
        }

        // Apply AutoFilter
        if (dataArray.length > 0) {
            const endRow = wsData.length - 1;
            const endCol = dataArray[0].length - 1;
            const range = {
                s: { r: tableStartRow, c: 0 },
                e: { r: endRow, c: endCol }
            };
            ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
        }

        // Auto-size columns slightly
        if (dataArray.length > 0) {
            const colWidths = dataArray[0].map(() => ({ wch: 18 }));
            ws['!cols'] = colWidths;
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Generate filename with current date
        const dateStr = new Date().toISOString().split('T')[0];
        const fullFilename = `${filename}_${dateStr}.xlsx`;

        // Write file
        XLSX.writeFile(wb, fullFilename);

        return { success: true };
    } catch (error) {
        console.error('Excel Export Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Format date to DD-MM-YYYY
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} - Formatted date
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    } catch {
        return dateStr;
    }
};

/**
 * Format date range text for display
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string} - Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `Period: ${start} to ${end}`;
};

/**
 * Format month/year range text for display
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {string} - Formatted month/year
 */
export const formatMonthYear = (year, month) => {
    const date = new Date(year, month - 1, 1);
    return `Period: ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
};
