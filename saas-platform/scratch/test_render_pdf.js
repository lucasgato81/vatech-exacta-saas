const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const storage = require('../src/database/storage');
const { renderMasterWorkflowHtml } = require('../src/renderers/master-workflow-engine');
const { PDFParse } = require('pdf-parse');

async function testPdfRendering() {
  console.log('1. Fetching batch os_261029114334...');
  const batch = storage.getBatchById('os_261029114334');
  if (!batch) {
    throw new Error('Batch not found');
  }

  console.log('2. Rendering full master HTML...');
  const fullHtml = renderMasterWorkflowHtml(batch.attendanceData);

  // Extract the dossier HTML that would be printed
  // Let's create an HTML file for Edge headless to print
  // In the web app, gerarHtmlDossieCompleto is evaluated with initial data
  // Let's create an evaluation script or extract gerarHtmlDossieCompleto
  const tempScriptPath = path.join(__dirname, 'temp_evaluate_dossier.js');
  
  // We can evaluate the local-preview functions in a node context (or jsdom-like mock)
  // Or write an HTML file that includes local-preview.html and immediately triggers print, OR edge headless --print-to-pdf
  
  // If we open fullHtml directly in Edge with a small auto-print or extract the iframe srcdoc:
  // Let's extract the gerarHtmlDossieCompleto code from local-preview.html and run it with mock payload
  const localPreviewPath = path.join(__dirname, '..', '..', 'local-preview.html');
  const previewContent = fs.readFileSync(localPreviewPath, 'utf8');

  // Extract the PDF functions block from "// MOTOR OFICIAL DE TEMPLATES PDF" to end of script
  const motorMarker = '// MOTOR OFICIAL DE TEMPLATES PDF';
  const motorIdx = previewContent.indexOf(motorMarker);
  if (motorIdx === -1) throw new Error('Motor marker not found');

  const scriptEnd = previewContent.indexOf('</script>', motorIdx);
  const pdfEngineCode = previewContent.substring(motorIdx, scriptEnd);

  // Construct context
  const evalCode = `
    const window = { INITIAL_DATA: ${JSON.stringify(batch.attendanceData)} };
    const document = {};
    ${pdfEngineCode}
    
    // Default answers matching initial state
    const c = {};
    for (let i = 1; i <= 63; i++) c['q' + i] = 'SIM';
    const rel = {
      horaInicial: '09:00',
      dataInicial: '2026-10-30',
      horaFinal: '18:00',
      dataFinal: '2026-10-30',
      motivo: 'INSTALAÇÃO DE EQUIPAMENTO',
      descricaoTecnica: 'Instalação física do equipamento PaX-i realizada em conformidade com o manual da fábrica. Conexão elétrica e lógica verificadas. Testes operacionais e calibração realizados com sucesso.'
    };
    const gar = {};
    const fb = {
      q1_opiniao: 'Otimo',
      q2_inicio: 'SIM', q2_sagital: 'SIM', q2_frankfurt: 'SIM', q2_canino: 'SIM', q2_lingua: 'SIM', q2_pes: 'SIM', q2_posicionadores: 'SIM', q2_colete: 'SIM',
      q3_paciente: 'SIM', q3_aquisicao: 'SIM', q3_visualizador: 'SIM', q3_consulta: 'SIM', q3_implante: 'SIM', q3_relatorio: 'SIM',
      q3b_mpr: 'SIM', q3b_secao: 'SIM', q3b_3dpan: 'SIM', q3b_tmj: 'SIM', q3b_implante: 'SIM', q3b_consulta: 'SIM', q3b_relatorio: 'SIM',
      q4: 'SIM', q5: 'NAO', q6: 'SIM', q7: 'SIM',
      expTreinamento: 'Treinamento excelente, equipe capacitada e instruída sobre todos os recursos do sistema.',
      expEntrega: 'Entrega pontual, equipamento chegou intacto com todas as proteções e manuais.'
    };
    const sigs = {};
    const fotos = {};
    
    const dossierHtml = gerarHtmlDossieCompleto(window.INITIAL_DATA, c, rel, gar, fb, sigs, fotos);
    return dossierHtml;
  `;

  const runFn = new Function(evalCode);
  const dossierHtml = runFn();

  const tempHtmlPath = path.join(__dirname, 'temp_dossier.html');
  fs.writeFileSync(tempHtmlPath, dossierHtml, 'utf8');
  console.log('3. Wrote temp_dossier.html (bytes:', dossierHtml.length, ')');

  // Print with msedge.exe headless
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outputPdfPath = path.join(__dirname, 'test_output_dossier.pdf');
  const tempUserDir = path.join(__dirname, 'temp_edge_user_data');

  console.log('4. Running headless Edge to generate PDF...');
  execSync(`"${edgePath}" --headless=new --disable-gpu --no-sandbox --user-data-dir="${tempUserDir}" --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" "${tempHtmlPath}"`, { stdio: 'inherit' });

  console.log('5. Parsing generated PDF with pdf-parse...');
  const pdfBuf = fs.readFileSync(outputPdfPath);
  const parser = new PDFParse({ data: pdfBuf });
  const doc = await parser.load();

  console.log('====================================');
  console.log('RESULTING PDF NUM PAGES:', doc.numPages);
  console.log('====================================');

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    const str = tc.items.map(x => x.str).join(' ');
    console.log(`Page ${i} (length: ${str.length}): ${str.substring(0, 100)}...`);
  }
}

testPdfRendering().catch(console.error);
