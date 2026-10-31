const mammoth = require('mammoth');

/**
 * Extracts text and structured paragraphs from a Word (.docx) buffer.
 * @param {Buffer} buffer 
 * @returns {Promise<{ text: string, html: string, messages: any[] }>}
 */
async function parseWord(buffer) {
  try {
    const rawResult = await mammoth.extractRawText({ buffer });
    const htmlResult = await mammoth.convertToHtml({ buffer });
    
    return {
      success: true,
      text: rawResult.value || '',
      html: htmlResult.value || '',
      messages: rawResult.messages || []
    };
  } catch (err) {
    console.error('Error parsing Word docx:', err);
    throw new Error(`Falha na extração do documento Word: ${err.message}`);
  }
}

module.exports = { parseWord };
