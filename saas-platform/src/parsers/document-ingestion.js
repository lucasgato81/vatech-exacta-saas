const path = require('path');
const { parsePdf } = require('./pdf-parser');
const { parseWord } = require('./word-parser');

/**
 * Ingests an uploaded document file buffer and returns unified text, metadata, and spatial line tokens.
 * @param {Buffer} buffer 
 * @param {string} originalName 
 * @param {string} mimeType 
 */
async function ingestDocument(buffer, originalName, mimeType) {
  const ext = path.extname(originalName).toLowerCase();
  
  if (ext === '.pdf' || mimeType === 'application/pdf') {
    const pdfData = await parsePdf(buffer);
    return {
      type: 'pdf',
      originalName,
      fileSize: buffer.length,
      numPages: pdfData.numPages,
      text: pdfData.text,
      pages: pdfData.pages,
      spatialLines: pdfData.spatialLines,
      rawInfo: pdfData.info
    };
  }
  
  if (ext === '.docx' || mimeType.includes('wordprocessingml') || ext === '.doc') {
    const wordData = await parseWord(buffer);
    return {
      type: 'word',
      originalName,
      fileSize: buffer.length,
      numPages: 1,
      text: wordData.text,
      pages: [wordData.text],
      spatialLines: [],
      html: wordData.html
    };
  }
  
  throw new Error(`Tipo de arquivo não suportado: ${ext}. Por favor, envie arquivos .pdf ou .docx`);
}

module.exports = { ingestDocument };
