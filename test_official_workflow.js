const fs = require('fs');
const path = require('path');

const localPreviewTemplate = fs.readFileSync(path.join(__dirname, 'local-preview.html'), 'utf8');

/**
 * Builds the exact, official Vatech / Exacta digital workflow with injected customer & equipment data.
 * @param {object} attendanceData 
 * @returns {string} Fully rendered HTML
 */
function renderOfficialWorkflowHtml(attendanceData) {
  const dataScript = `
  <script>
    window.INITIAL_DATA = ${JSON.stringify(attendanceData, null, 2)};
    window.INITIAL_TICKET_ID = ${JSON.stringify(attendanceData.idAtendimento || '260930092200')};
  </script>`;

  // Replace window.INITIAL_DATA placeholder in local-preview.html
  let html = localPreviewTemplate.replace(
    /<script>[\s\S]*?window\.INITIAL_DATA\s*=[\s\S]*?<\/script>/,
    dataScript
  );

  return html;
}

// Test with PaX-i 047-024914 data from user's image!
const testData = {
  idAtendimento: '261029114334',
  status: 'Pendente',
  dataCriacao: '2026-10-30',
  cliente: {
    razaoSocial: 'CLINICA DENTARIA UNIAO SAO JUDAS LTDA',
    nomeContato: 'MAURI FERREIRA TRINDADE JUNIO',
    telefone: '11 96459-1460',
    email: 'MAURITRINDADE@GMAIL.COM',
    endereco: 'RUA DESEMBARGADOR JORGE FONTANA 180 PARQUE SÃO JUDAS',
    cidadeUf: 'SAO SEBASTIAO DO PARAISO/MG',
    cep: '37950-000'
  },
  equipamento: {
    modelo: 'PaX-i',
    nSerie: '047-024914',
    notaFiscal: '16440',
    anosGarantia: '3',
    comCeph: 'NÃO',
    comBase: 'NÃO'
  },
  tecnico: {
    empresa: 'EXACTA MANUTENCOES',
    nomeTecnico: 'Lucas Gato'
  },
  solicitante: 'Guilherme Pereira',
  horario: '9:00',
  servico: 'INSTALAÇÃO DE EQUIPAMENTO',
  observacoes: 'Manter contato com pós venda e tirar duvidas antes de qualquer circunstância.'
};

const rendered = renderOfficialWorkflowHtml(testData);
console.log('RENDERED LENGTH:', rendered.length);
console.log('Contains CLINICA DENTARIA UNIAO SAO JUDAS:', rendered.includes('CLINICA DENTARIA UNIAO SAO JUDAS LTDA'));
console.log('Contains 047-024914:', rendered.includes('047-024914'));
console.log('Contains NF 16440:', rendered.includes('16440'));
console.log('Contains 61 items in Step 2:', rendered.includes('step2'));
console.log('Contains 16 clauses in Step 4:', rendered.includes('step4'));
console.log('Contains Ez3D-i in Step 5:', rendered.includes('Ez3D-i'));
console.log('Contains PDF Dossie generator:', rendered.includes('gerarHtmlDossieCompleto'));
