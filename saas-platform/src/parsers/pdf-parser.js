const { PDFParse } = require('pdf-parse');

/**
 * Extracts plain text, pages, metadata, and spatial line tokens with (x, y) coordinates from a PDF buffer.
 * @param {Buffer} buffer 
 * @returns {Promise<{ text: string, numPages: number, pages: string[], spatialLines: any[], info: any }>}
 */
async function parsePdf(buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const numPages = (result.pages && result.pages.length) || 1;
    const pagesText = result.pages ? result.pages.map(p => (typeof p === 'string' ? p : p.text || '')) : [result.text || ''];

    // Extract spatial coordinates from PDF document pages
    const doc = await parser.load();
    const spatialLines = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const tc = await page.getTextContent();
      const lines = {};

      for (const it of tc.items) {
        if (!it.str || !it.str.trim()) continue;
        const y = Math.round(it.transform[5]);
        const x = Math.round(it.transform[4]);

        // Tolerance of 3px for baseline horizontal alignment
        let matchedY = Object.keys(lines).find(ly => Math.abs(ly - y) <= 3);
        if (!matchedY) {
          matchedY = y;
          lines[matchedY] = [];
        }
        lines[matchedY].push({ str: it.str.trim(), x, y });
      }

      // Sort descending by Y (top of page to bottom)
      const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);
      const pageRows = sortedY.map(y => {
        // Sort items horizontally left to right
        const sortedItems = lines[y].sort((a, b) => a.x - b.x);
        return {
          y,
          items: sortedItems,
          text: sortedItems.map(i => i.str).join('  |  ')
        };
      });

      spatialLines.push(pageRows);
    }

    return {
      success: true,
      text: result.text || '',
      numPages,
      pages: pagesText,
      spatialLines,
      info: result.info || {}
    };
  } catch (err) {
    console.error('Error parsing PDF:', err);
    throw new Error(`Falha na extração do PDF: ${err.message}`);
  }
}

module.exports = { parsePdf };
