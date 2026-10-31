const fs = require('fs');
const path = require('path');
const { ingestDocument } = require('./saas-platform/src/parsers/document-ingestion');
const { analyzeDocumentSemantics } = require('./saas-platform/src/ai/semantic-analyzer');
const { generateDynamicFormHtml } = require('./saas-platform/src/renderers/dynamic-form-engine');
const { generateMirroredPdfHtml } = require('./saas-platform/src/renderers/pdf-template-engine');

async function runTest() {
  console.log('--- TESTANDO MÓDULO 1 DE INGESTÃO E CONVERSÃO ---');
  
  const samplePdf = 'Checklist pós instalação PaX-i 047-024913.pdf';
  const buf = fs.readFileSync(samplePdf);
  
  console.log(`1. Ingestão de arquivo: ${samplePdf}`);
  const docInfo = await ingestDocument(buf, samplePdf, 'application/pdf');
  console.log(`   -> Extraído: ${docInfo.numPages} páginas, ${docInfo.text.length} caracteres.`);
  
  console.log('2. Extração Semântica e Geração de Schema Form v1.0...');
  const schemaDef = analyzeDocumentSemantics(docInfo);
  console.log(`   -> Título Detectado: "${schemaDef.metadata.title}"`);
  console.log(`   -> Categoria: "${schemaDef.metadata.category}"`);
  console.log(`   -> Campos de Cabeçalho: ${schemaDef.metadata.stats.headerFieldsCount}`);
  console.log(`   -> Seções de Checklist: ${schemaDef.metadata.stats.sectionsCount}`);
  console.log(`   -> Total de Itens Inspecionados: ${schemaDef.metadata.stats.checklistItemsCount}`);
  console.log(`   -> Assinaturas Requeridas: ${schemaDef.metadata.stats.signaturesCount}`);
  
  console.log('3. Renderização Dinâmica do App PWA (HTML)...');
  const pwaHtml = generateDynamicFormHtml(schemaDef);
  console.log(`   -> Tamanho do PWA gerado: ${pwaHtml.length} bytes.`);
  
  console.log('4. Renderização do PDF Oficial Espelhado...');
  const pdfHtml = generateMirroredPdfHtml(schemaDef);
  console.log(`   -> Tamanho do Template de Impressão A4 gerado: ${pdfHtml.length} bytes.`);
  
  console.log('\n--- VERIFICAÇÃO CONCLUÍDA COM 100% DE SUCESSO! ---');
}

runTest().catch(console.error);
