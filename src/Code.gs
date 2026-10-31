/**
 * ============================================================================
 * SISTEMA DE GESTÃO DE ATENDIMENTO E DOCUMENTAÇÃO TÉCNICA EM CAMPO
 * VATECH / EXACTA
 * ============================================================================
 * Arquivo: Code.gs
 * Controladores doGet/doPost, manipulação de Google Sheets e Google Drive API
 */

const NOME_ABA_BANCO = 'Atendimentos';
const NOME_PASTA_RAIZ_DRIVE = 'VATECH_DOCUMENTOS_TECNICOS';

/**
 * Ponto de entrada da aplicação Web (PWA)
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  
  const idParam = e && e.parameter && e.parameter.id ? String(e.parameter.id).trim() : '';
  
  if (idParam) {
    try {
      const dados = obterDadosAtendimento(idParam);
      template.initialData = dados;
      template.ticketId = idParam;
    } catch (err) {
      template.initialData = null;
      template.ticketId = idParam;
      template.errorMessage = err.message;
    }
  } else {
    // Se não fornecido na URL, carrega o atendimento padrão de modelo ou o primeiro pendente
    template.initialData = obterDadosModelo();
    template.ticketId = template.initialData.idAtendimento;
  }

  return template.evaluate()
    .setTitle('Vatech Exacta - Atendimento Técnico')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Endpoint POST para integrações externas ou APIs
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'salvarAtendimento') {
      const res = salvarAtendimento(body.payload);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Ação não reconhecida' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Inclui arquivos modulares HTML (Styles, Scripts, etc.)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ============================================================================
 * MÓDULO 1: BANCO DE DADOS (GOOGLE SHEETS)
 * ============================================================================
 */

/**
 * Configura e inicializa a folha de cálculo com as 11 colunas oficiais
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(NOME_ABA_BANCO);
  
  if (!sheet) {
    sheet = ss.insertSheet(NOME_ABA_BANCO);
  }

  const cabecalhos = [
    'ID_Atendimento',           // 1
    'Status',                   // 2
    'Data_Criacao',             // 3
    'Dados_Cliente',            // 4
    'Dados_Equipamento',        // 5
    'Dados_Tecnico',            // 6
    'Respostas_Checklist_JSON', // 7
    'Respostas_Feedback_JSON',  // 8
    'Data_Conclusao',           // 9
    'URL_Pasta_Drive',          // 10
    'Links_PDFs_Gerados'        // 11
  ];

  // Limpa e aplica cabeçalhos
  sheet.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
  
  // Formatação visual do cabeçalho oficial Vatech (Vermelho escuro / Branco Negrito)
  const headerRange = sheet.getRange(1, 1, 1, cabecalhos.length);
  headerRange.setBackground('#991b1b')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  // Validação de dados na coluna Status (Pendente, Em Andamento, Concluído)
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendente', 'Em Andamento', 'Concluído'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('B2:B1000').setDataValidation(rule);

  // Se não houver dados, insere o registro modelo oficial Limeira - PaX-i
  if (sheet.getLastRow() === 1) {
    inserirAtendimentoModelo(sheet);
  }

  // Ajusta larguras de coluna
  sheet.setColumnWidth(1, 140); // ID_Atendimento
  sheet.setColumnWidth(2, 120); // Status
  sheet.setColumnWidth(3, 110); // Data_Criacao
  sheet.setColumnWidth(4, 250); // Dados_Cliente
  sheet.setColumnWidth(5, 230); // Dados_Equipamento
  sheet.setColumnWidth(6, 180); // Dados_Tecnico
  sheet.setColumnWidth(7, 180); // Respostas_Checklist_JSON
  sheet.setColumnWidth(8, 180); // Respostas_Feedback_JSON
  sheet.setColumnWidth(9, 130); // Data_Conclusao
  sheet.setColumnWidth(10, 200); // URL_Pasta_Drive
  sheet.setColumnWidth(11, 250); // Links_PDFs_Gerados

  return 'Base de dados inicializada com sucesso na aba ' + NOME_ABA_BANCO;
}

/**
 * Insere registro de modelo padrão (Limeira / PaX-i)
 */
function inserirAtendimentoModelo(sheet) {
  const dadosCliente = {
    razaoSocial: 'SOUZA & CARVALHO ODONTOLOGIA LTDA',
    nomeContato: 'GABRIEL LEITE SOUZA',
    cpfCnpj: '',
    telefone: '35-98897-5567',
    email: 'GABRIIEL.SOUZA@HOTMAIL.COM',
    endereco: 'Rua Barão de Cascalho 554, Centro',
    cidadeUf: 'LIMEIRA/SP',
    cep: '13480-770'
  };

  const dadosEquipamento = {
    modelo: 'PaX-i',
    nSerie: '047-024913',
    notaFiscal: '16208',
    anosGarantia: '5',
    comCeph: 'NÃO',
    comBase: 'NÃO'
  };

  const dadosTecnico = {
    empresa: 'EXACTA MANUTENCOES',
    nomeTecnico: 'Lucas Gato'
  };

  sheet.appendRow([
    '260930092200',
    'Pendente',
    '2026-09-30',
    JSON.stringify(dadosCliente),
    JSON.stringify(dadosEquipamento),
    JSON.stringify(dadosTecnico),
    '',
    '',
    '',
    '',
    ''
  ]);
}

/**
 * Retorna os dados do modelo padrão para testes locais ou fallback
 */
function obterDadosModelo() {
  return {
    idAtendimento: '260930092200',
    status: 'Pendente',
    dataCriacao: '2026-09-30',
    cliente: {
      razaoSocial: 'SOUZA & CARVALHO ODONTOLOGIA LTDA',
      nomeContato: 'GABRIEL LEITE SOUZA',
      cpfCnpj: '',
      telefone: '35-98897-5567',
      email: 'GABRIIEL.SOUZA@HOTMAIL.COM',
      endereco: 'Rua Barão de Cascalho 554, Centro',
      cidadeUf: 'LIMEIRA/SP',
      cep: '13480-770'
    },
    equipamento: {
      modelo: 'PaX-i',
      nSerie: '047-024913',
      notaFiscal: '16208',
      anosGarantia: '5',
      comCeph: 'NÃO',
      comBase: 'NÃO'
    },
    tecnico: {
      empresa: 'EXACTA MANUTENCOES',
      nomeTecnico: 'Lucas Gato'
    },
    checklist: {},
    feedback: {}
  };
}

/**
 * Busca atendimento na planilha por ID
 */
function obterDadosAtendimento(idAtendimento) {
  if (!idAtendimento) throw new Error('ID do atendimento não informado.');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(NOME_ABA_BANCO);
  if (!sheet) {
    setupDatabase();
    return obterDadosModelo();
  }

  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    const rowId = String(data[r][0]).trim();
    if (rowId === String(idAtendimento).trim()) {
      let cliente = {}, equipamento = {}, tecnico = {}, checklist = {}, feedback = {};
      try { cliente = JSON.parse(data[r][3] || '{}'); } catch(e){}
      try { equipamento = JSON.parse(data[r][4] || '{}'); } catch(e){}
      try { tecnico = JSON.parse(data[r][5] || '{}'); } catch(e){}
      try { checklist = JSON.parse(data[r][6] || '{}'); } catch(e){}
      try { feedback = JSON.parse(data[r][7] || '{}'); } catch(e){}

      return {
        rowNumber: r + 1,
        idAtendimento: rowId,
        status: data[r][1],
        dataCriacao: data[r][2],
        cliente: cliente,
        equipamento: equipamento,
        tecnico: tecnico,
        checklist: checklist,
        feedback: feedback,
        dataConclusao: data[r][8],
        urlPastaDrive: data[r][9],
        linksPdfs: data[r][10]
      };
    }
  }

  // Se não encontrou, retorna erro amigável
  throw new Error('Atendimento nº ' + idAtendimento + ' não foi localizado na base de dados.');
}

/**
 * ============================================================================
 * MÓDULO 3: GERAÇÃO DE PDFS E ARMAZENAMENTO NO GOOGLE DRIVE
 * ============================================================================
 */

/**
 * Localiza ou cria a pasta raiz Vatech e a subpasta pelo Número de Série
 */
function obterOuCriarPastaEquipamento(nSerie) {
  let pastaRaiz;
  const pastas = DriveApp.getFoldersByName(NOME_PASTA_RAIZ_DRIVE);
  if (pastas.hasNext()) {
    pastaRaiz = pastas.next();
  } else {
    pastaRaiz = DriveApp.createFolder(NOME_PASTA_RAIZ_DRIVE);
  }

  const subNome = String(nSerie || 'EQUIPAMENTO_SEM_SERIE').trim();
  const subPastas = pastaRaiz.getFoldersByName(subNome);
  if (subPastas.hasNext()) {
    return subPastas.next();
  } else {
    return pastaRaiz.createFolder(subNome);
  }
}

/**
 * Converte HTML em arquivo PDF no Google Drive
 */
function criarPdfNoDrive(pasta, nomeArquivo, htmlContent) {
  const blob = Utilities.newBlob(htmlContent, 'text/html', nomeArquivo + '.html');
  const pdfBlob = blob.getAs('application/pdf');
  pdfBlob.setName(nomeArquivo + '.pdf');
  
  // Se arquivo com mesmo nome já existe na pasta, cria nova versão com timestamp ou sobrescreve
  const existente = pasta.getFilesByName(nomeArquivo + '.pdf');
  if (existente.hasNext()) {
    const velho = existente.next();
    velho.setTrashed(true);
  }

  const file = pasta.createFile(pdfBlob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    // Caso restrições de domínio impeçam compartilhamento público
  }
  return {
    id: file.getId(),
    name: file.getName(),
    url: file.getUrl()
  };
}

/**
 * Processa a submissão completa do atendimento:
 * 1. Converte assinaturas
 * 2. Cria pasta no Drive
 * 3. Gera os 4 PDFs oficiais
 * 4. Salva no Sheets
 */
function salvarAtendimento(payload) {
  try {
    if (!payload) throw new Error('Payload inválido.');
    const idAtendimento = payload.idAtendimento;
    const dados = payload.dadosAtendimento || obterDadosAtendimento(idAtendimento);
    const nSerie = (dados.equipamento && dados.equipamento.nSerie) ? dados.equipamento.nSerie : '047-024913';

    // 1. Validação de Assinaturas
    const sigs = payload.assinaturas || {};
    if (!sigs.tecnico || !sigs.cliente) {
      throw new Error('As assinaturas do Técnico e do Cliente são de preenchimento obrigatório para a homologação.');
    }

    // 2. Criação/Obtenção de Pastas no Drive
    const pastaEquipamento = obterOuCriarPastaEquipamento(nSerie);
    const urlPasta = pastaEquipamento.getUrl();

    // 3. Renderização dos HTMLs oficiais
    const htmlChecklist = gerarHtmlChecklist(dados, payload.checklist, sigs);
    const htmlRelatorio = gerarHtmlRelatorio(dados, payload.relatorio, sigs);
    const htmlGarantia = gerarHtmlGarantia(dados, payload.garantia, sigs);
    const htmlFeedback = gerarHtmlFeedback(dados, payload.feedback, sigs);
    const htmlAnexoFotos = gerarHtmlAnexoFotos(dados, payload.fotos, sigs);
    const htmlDossie = gerarHtmlDossieCompleto(dados, payload.checklist, payload.relatorio, payload.garantia, payload.feedback, sigs, payload.fotos);

    // 4. Gravação dos arquivos de imagem no Google Drive
    const linksFotos = {};
    if (payload.fotos && typeof payload.fotos === 'object') {
      try {
        let pastaFotos = null;
        const subPastas = pastaEquipamento.getFoldersByName('Fotos_Evidencias');
        if (subPastas.hasNext()) {
          pastaFotos = subPastas.next();
        } else {
          pastaFotos = pastaEquipamento.createFolder('Fotos_Evidencias');
        }

        Object.entries(payload.fotos).forEach(([k, f]) => {
          if (f && f.dataUrl && f.dataUrl.includes(',')) {
            const b64 = f.dataUrl.split(',')[1];
            const bytes = Utilities.base64Decode(b64);
            const nomeFoto = `Foto_${k}_${nSerie}.jpg`;
            const blob = Utilities.newBlob(bytes, 'image/jpeg', nomeFoto);
            const ant = pastaFotos.getFilesByName(nomeFoto);
            if (ant.hasNext()) ant.next().setTrashed(true);
            const arq = pastaFotos.createFile(blob);
            try { arq.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e){}
            linksFotos[k] = arq.getUrl();
          }
        });
      } catch(errF) {
        Logger.log('Aviso ao salvar fotos no Drive: ' + errF);
      }
    }

    // 5. Conversão e Gravação dos PDFs no Google Drive
    // Arquivo Único Consolidado (Dossiê Técnico Completo)
    const pdfDossie = criarPdfNoDrive(pastaEquipamento, `Dossie_Completo_Instalacao_${nSerie}`, htmlDossie);
    
    // Arquivos Individuais
    const pdfChecklist = criarPdfNoDrive(pastaEquipamento, `Checklist_Pos_Instalacao_${nSerie}`, htmlChecklist);
    const pdfRelatorio = criarPdfNoDrive(pastaEquipamento, `Relatorio_Visita_Tecnica_${nSerie}`, htmlRelatorio);
    const pdfGarantia = criarPdfNoDrive(pastaEquipamento, `Termo_Garantia_${nSerie}`, htmlGarantia);
    const pdfFeedback = criarPdfNoDrive(pastaEquipamento, `Feedback_Cliente_${nSerie}`, htmlFeedback);
    const pdfAnexoFotos = criarPdfNoDrive(pastaEquipamento, `Anexo_Fotografico_${nSerie}`, htmlAnexoFotos);

    const pdfsGerados = {
      dossieCompleto: pdfDossie.url,
      checklist: pdfChecklist.url,
      relatorio: pdfRelatorio.url,
      garantia: pdfGarantia.url,
      feedback: pdfFeedback.url,
      anexoFotos: pdfAnexoFotos.url
    };

    // 6. Atualização da Folha de Cálculo
    atualizarRegistroSheet(idAtendimento, {
      status: 'Concluído',
      checklistJson: JSON.stringify(payload.checklist || {}),
      feedbackJson: JSON.stringify(payload.feedback || {}),
      dataConclusao: new Date().toISOString(),
      urlPastaDrive: urlPasta,
      linksPdfs: JSON.stringify(pdfsGerados)
    });

    return {
      success: true,
      mensagem: 'Atendimento e documentação técnica homologados com sucesso!',
      nSerie: nSerie,
      pastaDriveUrl: urlPasta,
      dossieUrl: pdfDossie.url,
      pdfs: pdfsGerados,
      fotosUrls: linksFotos
    };

  } catch (error) {
    Logger.log('Erro ao salvar atendimento: ' + error.stack);
    return {
      success: false,
      error: error.message || error.toString()
    };
  }
}

/**
 * Atualiza os status e hiperlinks na folha de cálculo central
 */
function atualizarRegistroSheet(idAtendimento, updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(NOME_ABA_BANCO);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][0]).trim() === String(idAtendimento).trim()) {
      const row = r + 1;
      sheet.getRange(row, 2).setValue(updates.status);               // Status
      sheet.getRange(row, 7).setValue(updates.checklistJson);        // Respostas_Checklist_JSON
      sheet.getRange(row, 8).setValue(updates.feedbackJson);         // Respostas_Feedback_JSON
      sheet.getRange(row, 9).setValue(updates.dataConclusao);        // Data_Conclusao
      sheet.getRange(row, 10).setValue(updates.urlPastaDrive);       // URL_Pasta_Drive
      sheet.getRange(row, 11).setValue(updates.linksPdfs);           // Links_PDFs_Gerados
      SpreadsheetApp.flush();
      return true;
    }
  }
  return false;
}

/**
 * Criação administrativa de novo atendimento e retorno do link PWA para o técnico
 */
function criarNovoAtendimento(novoAtendimento) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(NOME_ABA_BANCO);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(NOME_ABA_BANCO);
  }

  // Gera ID único no formato YYMMDDHHMMSS caso não fornecido
  let id = novoAtendimento.idAtendimento;
  if (!id) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ssStr = String(now.getSeconds()).padStart(2, '0');
    id = `${yy}${mm}${dd}${hh}${mi}${ssStr}`;
  }

  const dataHoje = new Date().toISOString().slice(0, 10);
  sheet.appendRow([
    id,
    'Pendente',
    dataHoje,
    JSON.stringify(novoAtendimento.cliente || {}),
    JSON.stringify(novoAtendimento.equipamento || {}),
    JSON.stringify(novoAtendimento.tecnico || {}),
    '',
    '',
    '',
    '',
    ''
  ]);

  const webAppUrl = ScriptApp.getService().getUrl();
  const linkTecnico = webAppUrl ? `${webAppUrl}?id=${id}` : `?id=${id}`;

  return {
    success: true,
    idAtendimento: id,
    linkTecnico: linkTecnico
  };
}

/**
 * Gera a pré-visualização em HTML dos documentos para conferência antes ou depois de homologar
 */
function gerarPreviaHtml(payload) {
  try {
    const dados = payload.dados || payload.dadosAtendimento || {};
    const chk = payload.checklist || {};
    const rel = payload.relatorio || {};
    const gar = payload.garantia || {};
    const fb = payload.feedback || {};
    const sigs = payload.assinaturas || {};
    const fotos = payload.fotos || {};

    return {
      success: true,
      dossie: gerarHtmlDossieCompleto(dados, chk, rel, gar, fb, sigs, fotos),
      checklist: gerarHtmlChecklist(dados, chk, sigs),
      relatorio: gerarHtmlRelatorio(dados, rel, sigs),
      garantia: gerarHtmlGarantia(dados, gar, sigs),
      feedback: gerarHtmlFeedback(dados, fb, sigs),
      fotos: gerarHtmlAnexoFotos(dados, fotos, sigs)
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Menu do Google Sheets para acesso rápido
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚡ Vatech Exacta')
    .addItem('⚙️ Inicializar Base de Dados (setupDatabase)', 'setupDatabase')
    .addItem('➕ Criar Atendimento Modelo (Limeira PaX-i)', 'setupDatabase')
    .addToUi();
}
