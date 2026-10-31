const fs = require('fs');
const { PDFParse } = require('./saas-platform/node_modules/pdf-parse');

/**
 * Extracts line-grouped text from PDF using (x, y) coordinates.
 */
async function extractSpatialLines(buffer) {
  const p = new PDFParse({ data: buffer });
  const doc = await p.load();
  const allPagesLines = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const tc = await page.getTextContent();
    const lines = {};

    for (const it of tc.items) {
      if (!it.str || !it.str.trim()) continue;
      const y = Math.round(it.transform[5]);
      const x = Math.round(it.transform[4]);

      // Tolerance of 3px for baseline alignment
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

    allPagesLines.push(pageRows);
  }

  return allPagesLines;
}

/**
 * Intelligent Key-Value pair extractor from spatial rows.
 */
function extractKeyValuePairsFromRows(pageRows) {
  const fields = [];
  const addedIds = new Set();

  function addField(label, value, type = 'text', section = 'Geral') {
    const cleanLabel = label.replace(/[:\.\-_]+$/, '').trim();
    if (!cleanLabel || cleanLabel.length < 2) return;
    const id = cleanLabel
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!addedIds.has(id)) {
      addedIds.add(id);
      fields.push({
        id,
        label: cleanLabel,
        defaultValue: (value || '').trim(),
        type,
        section,
        required: true
      });
    }
  }

  for (let r = 0; r < pageRows.length; r++) {
    const row = pageRows[r];
    const items = row.items;

    for (let i = 0; i < items.length; i++) {
      const itemText = items[i].str;

      // Check if item contains an explicit label with colon, e.g. "Nome :" or "Solicitação n.:"
      if (itemText.includes(':')) {
        const parts = itemText.split(':');
        const labelPart = parts[0].trim();
        const inlineVal = parts.slice(1).join(':').trim();

        if (inlineVal) {
          // Label and value in the same text item (e.g. "Data de Serviço: 2026-10-30")
          addField(labelPart, inlineVal);
        } else if (i + 1 < items.length) {
          // Next item in the same row is the value!
          const nextItem = items[i + 1];
          // Check if next item is not another label
          if (!nextItem.str.endsWith(':')) {
            addField(labelPart, nextItem.str);
            i++; // skip next item since it was consumed as value
          } else {
            addField(labelPart, '');
          }
        } else if (r + 1 < pageRows.length) {
          // Sometimes the value is in the next row below the label
          const nextRow = pageRows[r + 1];
          if (nextRow.items.length === 1 && !nextRow.items[0].str.includes(':')) {
            addField(labelPart, nextRow.items[0].str);
          } else {
            addField(labelPart, '');
          }
        }
      }
    }
  }

  return fields;
}

async function test() {
  const buf = fs.readFileSync('Solicitação de instalaçãoPaX-i 047-024913.pdf');
  const pages = await extractSpatialLines(buf);
  const kvs = extractKeyValuePairsFromRows(pages[0]);
  console.log('EXTRACTED FIELDS WITH ORIGINAL VALUES:');
  kvs.forEach(f => console.log(`- [${f.label}]: "${f.defaultValue}"`));
}

module.exports = { extractSpatialLines, extractKeyValuePairsFromRows };

if (require.main === module) {
  test();
}
