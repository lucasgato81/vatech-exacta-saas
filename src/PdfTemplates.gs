/**
 * Vatech & Exacta - Motor de Templates PDF
 * Gera o HTML rigorosamente diagramado e compatível com a engine de PDF do Google Apps Script
 * (Utilities.newBlob(html, 'text/html').getAs('application/pdf'))
 */

const VATECH_LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAAfCAYAAADz23MvAAAEMUlEQVR4nO1Xa2hcRRQ+M3NnZpuwu0kbG6u7eTSbzb5u6uuHUPJDMEVFi00p2JYWpAhawQdUELTgj4KhWMFSC4qPID7AUhupaAnRQopaTdNtQpt2G7Hgg4JSKjGF1miUEW88Ge69e3eTZhs6HxxYZs535pzzzZ3ZATAwMDAwMDAwMDCoCMZCK/52rCDbpyqdz3UNI8Y1hOtGDA4gcbESyKJK56TDiHENYV7FiACrPSnty471i9R3Xr4vWrG3sG8VkLAaPyxS5/IyN35a2n/i5JWpsWMiezEOPKHH08XAsbHpvAbgCRXztLQn9WYNy9ylx9nSF7xqiAJd8q3IXtBzLUh7alTaf6i4T9L6HY6/Xs8paV85K9un8NgJmZt4gEQ3li0CBg6sEvLy04v3StjLvhTp8zieLoaXYU5eZMeDcNTm0PN/kzcfCsL9XKS+L7U2ZzPNqRjKLAARxK+chLex+p3lirHfSgyWstYeEvvI4a4k1Z1BeeWKoewp9v9XVRbuIuHVOOAdpKpD92EADPtsoXXPOHMhoFVesSkQVtA+ay8xit0Z2HdApH8iAGRmjmRGjoMie8GNq6wBxHKvdcJAa9x4bndGPbCY35dcMurAWoaD7eeJQd3nAG8dwj4pkLcEjb/Xajww12LsZPF3ivmo899tvJSGFRND4ajI/DpnYiickfZffgELst13/j/Qe2lk3RZWt63bivXkRfZ3v2NnNmJ0s/jbzrjibaZLnviYt+ZnHDfc+7gJ2pcgYgyI9A9zKkYvbzmOA+J7Q/3Gcyd4dgJz2yF0ZynnqsObjRilrOPGDdqXioihL/wsXbbLGV9FImvxXAToYmduOYi0VzNGpT3Zy1uPHxWZX+ZLjDPSnurhjf3FuOX0pGJi9Iu26fdGH0+O4Tn6730+nciPeO5RdsNzetxXr8KdMSSyv30mkqN7rIbeNpAr9Mvcj7sgxHiJxd91C4rH9vHEN5gzJLIXiyWylzf2Bjk+VtOaTX75Yd/XraZPSqltwYmhXrY46C4r9t7z7MbdeKwReBJzvhKZ836JuL0l/IoNAan2yk+Pg/+C6ugk4bV+3HU0+ogX90Fas9krPzf/qyKGW9LFdtTTrH5HkLPcsQ20divmj4j05aBrrqeLHytlLbxOGFg0KM/r0TfvYtwMvNkrybtJZI0b5wPeciRIkVvp0u06V305wzI3EbSpr1lNB8sRQ+F+Et2woMRQSEPo1j6ePOsE/8JqO3cbqVrpx1GX6HZ20+48z0w39pTMTX5otXzdScJrqHqM++B2sqjjFdawb1jkLjmFD/DUzy+z+Pu6bzWQ8H00+lAfbxsryNz0635EZq4c4slCF619uINU3+O2DgfCO2mk6yBvHcENPCbS429YTZ+uopGuZhApx1/dTY6pjeAWs5vFerCfb3MNDAwMDAwMDAxmgX8A6OJG9F8OI3AAAAAASUVORK5CYII=";

// Estilo CSS base compartilhado para documentos impressos em PDF
const PDF_GLOBAL_STYLE = `
  @page {
    size: A4 portrait;
    margin: 6mm 6mm 6mm 6mm;
  }
  @media print {
    html, body {
      width: 100% !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page-break-always {
      page-break-after: always !important;
      break-after: page !important;
      display: block !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      clear: both !important;
    }
    .avoid-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111827;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 7.2pt;
    line-height: 1.12;
    background-color: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    box-sizing: border-box;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0;
    padding: 0;
    table-layout: fixed;
    box-sizing: border-box;
  }
  td, th {
    border: 1px solid #000000;
    padding: 1.5px 3px;
    vertical-align: middle;
    box-sizing: border-box;
    word-wrap: break-word;
  }
  .checklist-frame {
    border: 2px solid #0000ff;
    padding: 3px;
    box-sizing: border-box;
    background: #ffffff;
    width: 100%;
    margin-bottom: 2px;
  }
  .banner-yellow {
    background-color: #ffff00 !important;
    font-weight: bold;
    font-size: 7.8pt;
    padding: 1.5px 3.5px;
    border: 1px solid #000000;
    color: #000000;
  }
  .banner-gray {
    background-color: #e5e7eb !important;
    font-weight: bold;
    font-size: 7.4pt;
    padding: 1.5px 3.5px;
    border: 1px solid #000000;
  }
  .bg-header-blue {
    background-color: #b4c5e7 !important;
    font-weight: bold;
    text-align: center;
    border: 1px solid #000000;
    font-size: 7.8pt;
    color: #000000;
  }
  .bg-header-white {
    background-color: #ffffff !important;
    border: 1px solid #000000;
    font-size: 7.8pt;
    color: #000000;
  }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-bold { font-weight: bold; }
  .noborder { border: none !important; }
  .border-top-only { border-top: 1px solid #000; border-bottom: none; border-left: none; border-right: none; }
  .chk-checked {
    font-weight: bold;
    color: #000000;
  }
  .chk-unchecked {
    color: #4b5563;
  }
  .sig-img {
    max-height: 38px;
    max-width: 180px;
    display: block;
    margin: 1px auto;
  }
  .footer-confidential {
    font-size: 6.8pt;
    color: #6b7280;
    text-align: center;
    margin-top: 4px;
    border-top: 0.5px solid #d1d5db;
    padding-top: 2px;
  }
`;

/**
 * Funções auxiliares de marcação
 */
function chk(val, expected) {
  const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  const isMatch = (norm(val) === norm(expected));
  return isMatch ? '<b>[ X ]</b>' : '[ &nbsp; ]';
}

function boolChk(val, isPositive) {
  const v = String(val || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  const yes = (v === 'SIM' || v === 'TRUE' || v === '1' || v === 'S');
  if (isPositive) {
    return yes ? '<b>SIM ( X )</b>' : 'SIM (&nbsp;&nbsp;)';
  } else {
    return !yes ? '<b>NÃO ( X )</b>' : 'NÃO (&nbsp;&nbsp;)';
  }
}

function safeText(str, fallback) {
  if (str === null || str === undefined || String(str).trim() === '') {
    return fallback !== undefined ? fallback : '';
  }
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function safeMultilineText(str, fallback) {
  const s = safeText(str, fallback);
  return s.replace(/\r\n|\n|\r/g, '<br>');
}

function formatBrDate(dateInput) {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return String(dateInput);
  }
}

/**
 * ============================================================================
 * 1. CHECKLIST PÓS-INSTALAÇÃO (Check List Pós Instalação - Installation Report)
 * ============================================================================
 */
function gerarHtmlChecklist(dados, c, sigs) {
  c = c || {};
  sigs = sigs || {};
  dados = dados || {};
  const cli = dados.cliente || {};
  const eq = dados.equipamento || {};
  const tec = dados.tecnico || {};

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${PDF_GLOBAL_STYLE}</style>
</head>
<body>

  <!-- TOPO: LOGO E TÍTULO -->
  <div class="checklist-frame">
  <table style="margin-bottom: 2px; border-bottom: 1px solid #000000;">
    <tr>
      <td style="width: 22%; border: none; vertical-align: middle; padding: 2px 4px;">
        <img src="${VATECH_LOGO_BASE64}" style="height: 20px; width: auto;" alt="Vatech" />
      </td>
      <td style="width: 78%; border: none; text-align: center; vertical-align: middle; padding: 2px 4px;">
        <div style="font-size: 10.5pt; font-weight: bold; letter-spacing: 0.2px;">Check List Pós Instalação - Installation Report ver.05</div>
      </td>
    </tr>
  </table>

  <!-- CABEÇALHO TÉCNICO -->
  <table style="margin-bottom: 2px;">
    <tr>
      <td style="width: 17%;" class="bg-header-blue">Data de Instalação</td>
      <td style="width: 18%;" class="bg-header-white text-center">${safeText(dados.dataCriacao || formatBrDate(new Date()))}</td>
      <td style="width: 10%;" class="bg-header-blue">Técnico</td>
      <td style="width: 23%;" class="bg-header-white text-center">${safeText(tec.nomeTecnico)}</td>
      <td style="width: 11%;" class="bg-header-blue">Empresa</td>
      <td style="width: 21%;" class="bg-header-white text-center">${safeText(tec.empresa || 'EXACTA MANUTENCOES')}</td>
    </tr>
  </table>

  <!-- 1. INFORMAÇÕES DO CLIENTE -->
  <div class="banner-yellow">1. Informações do Cliente</div>
  <table style="margin-bottom: 2px;">
    <tr>
      <td style="width: 15%;" class="bg-header-blue">Local/ Clínica</td>
      <td style="width: 48%;" class="bg-header-white">${safeText(cli.razaoSocial)}</td>
      <td style="width: 11%;" class="bg-header-blue">Cliente</td>
      <td style="width: 26%;" class="bg-header-white">${safeText(cli.nomeContato)}</td>
    </tr>
    <tr>
      <td class="bg-header-blue">Endereço</td>
      <td colspan="3" class="bg-header-white">${safeText(cli.endereco)}</td>
    </tr>
    <tr>
      <td class="bg-header-blue">Nº Contato</td>
      <td class="bg-header-white" style="color: #000000 !important; text-decoration: none;">${safeText(cli.telefone)}</td>
      <td class="bg-header-blue">Cidade/ UF</td>
      <td class="bg-header-white">${safeText(cli.cidadeUf)}</td>
    </tr>
  </table>

  <!-- 2. INFORMAÇÕES DO EQUIPAMENTO -->
  <div class="banner-yellow">2. Informações do Equipamento</div>
  <table style="margin-bottom: 2px;">
    <tr>
      <td style="width: 15%;" class="bg-header-blue">Equipamento</td>
      <td style="width: 40%;" class="bg-header-white">${safeText(eq.modelo || 'PaX-i')}</td>
      <td style="width: 13%;" class="bg-header-white text-center">n. Série:</td>
      <td style="width: 32%;" class="bg-header-white" style="color: #000000 !important; font-weight: normal;">${safeText(eq.nSerie)}</td>
    </tr>
  </table>

  <!-- D. CHECK LIST (TABELA DOS 61 ITENS) -->
  <div class="banner-yellow">D. Check list</div>
  <table>
    <tr style="background-color: #ffffff; font-weight: bold; text-align: center;">
      <th style="width: 4%; background: #ffffff;">Nº</th>
      <th style="width: 16%; background: #ffffff;">Categoria</th>
      <th style="width: 62%; background: #ffffff;">Conteúdo</th>
      <th style="width: 18%; background: #ffffff;">Confirmação</th>
    </tr>

    <!-- CATEGORIA 1: Antes da abertura das Caixas (Itens 1-6) -->
    <tr>
      <td class="text-center">1</td>
      <td rowspan="6" class="text-bold text-center" style="background:#ffffff; font-size: 8pt; line-height: 1.25; vertical-align: middle;">Antes da<br>abertura<br>das Caixas</td>
      <td>O Instalador acompanhou a entrega do equipamento?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q1, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q1, false)}</td>
    </tr>
    <tr>
      <td class="text-center">2</td>
      <td>A empresa de entrega transportou e manuseou com cautela?</td>
      <td class="text-center">${boolChk(c.q2, true)} &nbsp; ${boolChk(c.q2, false)}</td>
    </tr>
    <tr>
      <td class="text-center">3</td>
      <td>O instalador certificou-se de que não há furos ou riscos suspeitos na caixa?</td>
      <td class="text-center">${boolChk(c.q3, true)} &nbsp; ${boolChk(c.q3, false)}</td>
    </tr>
    <tr>
      <td class="text-center">4</td>
      <td>O indicador ShockWatch está vermelho? <i>(indicador de impacto da caixa)</i></td>
      <td class="text-center">${boolChk(c.q4, true)} &nbsp; ${boolChk(c.q4, false)}</td>
    </tr>
    <tr>
      <td class="text-center">5</td>
      <td>O indicador TiltWatch está vermelho? <i>(indicador de tombamento da caixa)</i></td>
      <td class="text-center">${boolChk(c.q5, true)} &nbsp; ${boolChk(c.q5, false)}</td>
    </tr>
    <tr>
      <td class="text-center">6</td>
      <td>Os instaladores certificaram-se de que não há arranhões ou superfícies quebradas equipamento?</td>
      <td class="text-center">${boolChk(c.q6, true)} &nbsp; ${boolChk(c.q6, false)}</td>
    </tr>

    <!-- CATEGORIA 2: Após abertura da Caixa (Itens 7-8) -->
    <tr>
      <td class="text-center">7</td>
      <td rowspan="2" class="text-bold text-center" style="background:#ffffff; font-size: 8pt; line-height: 1.25; vertical-align: middle;">Após<br>abertura da<br>Caixa</td>
      <td>Todos os acessórios e caixas estão incluídos na embalagem?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q7, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q7, false)}</td>
    </tr>
    <tr>
      <td class="text-center">8</td>
      <td>
        Foi realizado o check-list de conferência de itens no Kit de instalação?<br>
        <div style="font-size: 7.2pt; color: #374151; margin-top: 1px;">
          ${chk(c.q8_disparador, true)} Disparador &nbsp;&nbsp;
          ${chk(c.q8_cabos, true)} Cabos de comunicação &nbsp;&nbsp;
          ${chk(c.q8_posicionadores, true)} Posicionadores &nbsp;&nbsp;
          ${chk(c.q8_pendrives, true)} Pendrives<br>
          ${chk(c.q8_manuais, true)} Manuais &nbsp;&nbsp;
          ${chk(c.q8_fixadores, true)} Fixadores de parede &nbsp;&nbsp;
          ${chk(c.q8_fibra, true)} Placa fibra ótica (tomo) &nbsp;&nbsp;
          ${chk(c.q8_controle, true)} Controle up/down
        </div>
      </td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q8, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q8, false)}</td>
    </tr>

    <!-- CATEGORIA 3: Antes de Iniciar Instalação (Itens 9-25) -->
    <tr>
      <td class="text-center">9</td>
      <td rowspan="17" class="text-bold text-center" style="background:#ffffff; font-size: 8pt; line-height: 1.25; vertical-align: middle;">Antes de<br>Iniciar<br>Instalação</td>
      <td>O disjuntor está instalado no painel de distribuição ? &nbsp; <b>Valor:</b> <u>${safeText(c.q9_valor, '_________')}</u></td>
      <td class="text-center">${boolChk(c.q9, true)} &nbsp; ${boolChk(c.q9, false)}</td>
    </tr>
    <tr>
      <td class="text-center">10</td>
      <td>Há DPS instalado no circuito dedicado ao equipamento?</td>
      <td class="text-center">${boolChk(c.q10, true)} &nbsp; ${boolChk(c.q10, false)}</td>
    </tr>
    <tr>
      <td class="text-center">11</td>
      <td>O Aterramento está instalado e o cabo de terra está chegando na tomada do equipamento e do Computador?</td>
      <td class="text-center">${boolChk(c.q11, true)} &nbsp; ${boolChk(c.q11, false)}</td>
    </tr>
    <tr>
      <td class="text-center">12</td>
      <td>A tomada da sala é com plugues 20A?</td>
      <td class="text-center">${boolChk(c.q12, true)} &nbsp; ${boolChk(c.q12, false)}</td>
    </tr>
    <tr>
      <td class="text-center">13</td>
      <td>O Equipamento e computador estão ligados no mesmo Estabilizador/ Nobreak?</td>
      <td class="text-center">${boolChk(c.q13, true)} &nbsp; ${boolChk(c.q13, false)}</td>
    </tr>
    <tr>
      <td class="text-center">14</td>
      <td>Há Nobreak ou Estabilizador instalado e dedicado para o equipamento?</td>
      <td class="text-center">
        ${chk(c.q14_tipo, 'Estabilizador')} Estabil. &nbsp; ${chk(c.q14_tipo, 'Nobreak')} Nobreak
      </td>
    </tr>
    <tr>
      <td class="text-center">15</td>
      <td colspan="2">
        <b>Informações Equipamento:</b> Marca: <u>${safeText(c.q15_marca, '________')}</u> &nbsp;
        Modelo: <u>${safeText(c.q15_modelo, '________')}</u> &nbsp;
        Potência: <u>${safeText(c.q15_potencia, '____')}</u> Kva
      </td>
    </tr>
    <tr>
      <td class="text-center">16</td>
      <td>Há um nobreak ou estabilizador para o computador? &nbsp; ${chk(c.q16_possui, 'SIM')} Sim &nbsp; ${chk(c.q16_possui, 'NAO')} Não</td>
      <td class="text-center">
        ${chk(c.q16_tipo, 'Estabilizador')} Estabil. &nbsp; ${chk(c.q16_tipo, 'Nobreak')} Nobreak
      </td>
    </tr>
    <tr>
      <td class="text-center">17</td>
      <td colspan="2">
        <b>Informações Computador:</b> Marca: <u>${safeText(c.q17_marca, '________')}</u> &nbsp;
        Modelo: <u>${safeText(c.q17_modelo, '________')}</u> &nbsp;
        Potência: <u>${safeText(c.q17_potencia, '____')}</u> Kva
      </td>
    </tr>
    <tr>
      <td class="text-center">18</td>
      <td>A tomada de saída do Nobreak/Estabilizador é com plugues 20A?</td>
      <td class="text-center">${boolChk(c.q18, true)} &nbsp; ${boolChk(c.q18, false)}</td>
    </tr>
    <tr>
      <td class="text-center">19</td>
      <td>A Tomada da sala é 220V?</td>
      <td class="text-center">
        ${chk(c.q19_tipo, 'F+F')} F+F &nbsp;&nbsp; ${chk(c.q19_tipo, 'F+N')} F+N
      </td>
    </tr>
    <tr>
      <td class="text-center">20</td>
      <td colspan="2">
        <b>Valor de saída do nobreak/estabilizador:</b> &nbsp;
        F+F = <u>${safeText(c.q20_ff, '____')}</u>V &nbsp;&nbsp;
        F+N = <u>${safeText(c.q20_fn, '____')}</u>V &nbsp;&nbsp;
        F1+T = <u>${safeText(c.q20_f1t, '____')}</u>V &nbsp;&nbsp;
        F2+T = <u>${safeText(c.q20_f2t, '____')}</u>V &nbsp;&nbsp;
        N+T = <u>${safeText(c.q20_nt, '____')}</u>V
      </td>
    </tr>
    <tr>
      <td class="text-center">21</td>
      <td>Há Ar-condicionado com funcionamento em conformidade?</td>
      <td class="text-center">${boolChk(c.q21, true)} &nbsp; ${boolChk(c.q21, false)}</td>
    </tr>
    <tr>
      <td class="text-center">22</td>
      <td>Foi capturada foto da Etiqueta do numero de série (coluna do equipamento) ?</td>
      <td class="text-center">${boolChk(c.q22, true)} &nbsp; ${boolChk(c.q22, false)}</td>
    </tr>
    <tr>
      <td class="text-center">23</td>
      <td>Número de Série da etiqueta confere com Caixa e NF ?</td>
      <td class="text-center">${boolChk(c.q23, true)} &nbsp; ${boolChk(c.q23, false)}</td>
    </tr>
    <tr>
      <td class="text-center">24</td>
      <td>Foi capturada foto do Cabo de energia do Equipamento (Power Cord)?</td>
      <td class="text-center">${boolChk(c.q24, true)} &nbsp; ${boolChk(c.q24, false)}</td>
    </tr>
    <tr>
      <td class="text-center">25</td>
      <td>Cabo Energia, Qual o Tipo do Plug:</td>
      <td class="text-center">
        ${chk(c.q25_plug, 'ABNT 20A')} ABNT 20A &nbsp; ${chk(c.q25_plug, 'Tipo Borne')} Borne
      </td>
    </tr>

    <!-- CATEGORIA 4: Durante a Instalação (Itens 26 a 33) -->
    <tr>
      <td class="text-center">26</td>
      <td rowspan="8" class="text-bold text-center" style="background:#ffffff; font-size: 8pt; line-height: 1.25; vertical-align: middle;">Durante a<br>Instalação</td>
      <td>(apenas para PaX-i) O equipamento é Fixado no chão e Parede ou em base?</td>
      <td class="text-center">
        ${chk(c.q26_fixacao, 'CHAO')} CHÃO &nbsp; ${chk(c.q26_fixacao, 'BASE')} BASE
      </td>
    </tr>
    <tr>
      <td class="text-center">27</td>
      <td>O Instalador tem a certeza de que os cabos, especialmente de fibra óptica, não estão dobrados ou muito enrolados?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q27, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q27, false)}</td>
    </tr>
    <tr>
      <td class="text-center">28</td>
      <td>O instalador tem certeza que os cabos estão bem conectados ao equipamento e computador?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q28, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q28, false)}</td>
    </tr>
    <tr>
      <td class="text-center">29</td>
      <td>O equipamento foi bem nivelado/ balanceado (Esquerda/ Direita e Frente/ Trás)?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q29, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q29, false)}</td>
    </tr>
    <tr>
      <td class="text-center">30</td>
      <td>O equipamento foi corretamento fixado na parede?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q30, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q30, false)}</td>
    </tr>
    <tr>
      <td class="text-center">31</td>
      <td>Todos os cabos estão bem organizados ?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q31, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q31, false)}</td>
    </tr>
    <tr>
      <td class="text-center">32</td>
      <td>O equipamento está apresentando algum problema ou defeito visualmente ?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q32, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q32, false)}</td>
    </tr>
    <tr>
      <td class="text-center">33</td>
      <td>O Painel de Led (verde) está ligado e a movimentação está conforme ?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q33, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q33, false)}</td>
    </tr>
  </table>
  </div> <!-- fim da checklist-frame da Folha 1 -->

  <!-- QUEBRA DE PÁGINA OBRIGATÓRIA: FIM DA FOLHA 1 (ITENS 1 A 33) E INÍCIO DA FOLHA 2 (ITENS 34 A 63) -->
  <div class="page-break-always" style="page-break-after: always; break-after: page;"></div>

  <div class="checklist-frame">
  <!-- CHECK LIST (FOLHA 2: ITENS 34 A 63 + ASSINATURAS) -->
  <table>
    <tr style="background-color: #ffffff; font-weight: bold; text-align: center;">
      <th style="width: 4%; background: #ffffff;">Nº</th>
      <th style="width: 16%; background: #ffffff;">Categoria</th>
      <th style="width: 62%; background: #ffffff;">Conteúdo</th>
      <th style="width: 18%; background: #ffffff;">Confirmação</th>
    </tr>

    <!-- CATEGORIA 5: Depois de instalação (Itens 34 a 36b) -->
    <tr>
      <td class="text-center">34</td>
      <td rowspan="4" class="text-bold text-center" style="background:#ffffff; font-size: 8pt; line-height: 1.25; vertical-align: middle;">Depois de<br>instalação</td>
      <td>Deixado o kit de barras de transporte junto com o kit de acessórios do equipamento?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q34, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q34, false)}</td>
    </tr>
    <tr>
      <td class="text-center">35</td>
      <td>O botão up/down do equipamento funciona corretamente?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q35, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q35, false)}</td>
    </tr>
    <tr>
      <td class="text-center">36</td>
      <td>O equipamento possui barramentos internos de Aterramento? <i>(3 barras cobre + cabo terra) - Bush Brass</i></td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q36, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q36, false)}</td>
    </tr>
    <tr>
      <td class="text-center">36b</td>
      <td>Feito o reforço preventivo no cabo do sensor Pan/Tomo? <i>*(Exclusivo para casos de vatech A9)*</i></td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q36b, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q36b, false)}</td>
    </tr>

    <!-- CATEGORIA 6: PC (ITENS 37 A 55 - CONTÍNUO NA FOLHA 2) -->
    <tr>
      <td class="text-center">37</td>
      <td rowspan="21" class="text-bold text-center" style="background:#ffffff; font-size: 8.5pt; vertical-align: middle;">PC</td>
      <td>Computador e Monitor inclusos no equipamento?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q37, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q37, false)}</td>
    </tr>
    <tr>
      <td class="text-center">38</td>
      <td colspan="2"><b>Modelo CPU:</b> <u>${safeText(c.q38_modelo, '________________')}</u> &nbsp;&nbsp;&nbsp; <b>N. Série CPU:</b> <u>${safeText(c.q38_nserie, '________________')}</u></td>
    </tr>
    <tr>
      <td class="text-center">39</td>
      <td colspan="2"><b>Modelo Monitor:</b> <u>${safeText(c.q39_modelo, '________________')}</u> &nbsp;&nbsp;&nbsp; <b>N. Série Monitor:</b> <u>${safeText(c.q39_nserie, '________________')}</u></td>
    </tr>
    <tr>
      <td class="text-center">40</td>
      <td>O computador possui placa de Rede Gigabit ? Foi instalado a PCI do Kit? (PaX-i)</td>
      <td class="text-center">${boolChk(c.q40, true)} &nbsp; ${boolChk(c.q40, false)}</td>
    </tr>
    <tr>
      <td class="text-center">41</td>
      <td>O computador possui placa de Video dedicada ?</td>
      <td class="text-center">${boolChk(c.q41, true)} &nbsp; ${boolChk(c.q41, false)}</td>
    </tr>
    <tr>
      <td class="text-center">42</td>
      <td>A rede de internet está disponível para o PC ?</td>
      <td class="text-center">${boolChk(c.q42, true)} &nbsp; ${boolChk(c.q42, false)}</td>
    </tr>
    <tr>
      <td class="text-center">43</td>
      <td>Ez3D-i instalado? (se necessário)</td>
      <td class="text-center">${boolChk(c.q43, true)} &nbsp; ${boolChk(c.q43, false)}</td>
    </tr>
    <tr>
      <td class="text-center">44</td>
      <td>Cliente irá imprimir em impressora DRY pelo Software Vatech?</td>
      <td class="text-center">${boolChk(c.q44, true)} &nbsp; ${boolChk(c.q44, false)}</td>
    </tr>
    <tr>
      <td class="text-center">45</td>
      <td colspan="2">
        <b>Dados Impressora:</b> Marca: <u>${safeText(c.q45_marca, '____')}</u> Modelo: <u>${safeText(c.q45_modelo, '____')}</u>
        AE TITLE: <u>${safeText(c.q45_aetitle, '____')}</u> IP: <u>${safeText(c.q45_ip, '____')}</u> Porta: <u>${safeText(c.q45_porta, '____')}</u>
      </td>
    </tr>
    <tr>
      <td class="text-center">46</td>
      <td>Foi realizado a calibração de impressão e testes?</td>
      <td class="text-center">${boolChk(c.q46, true)} &nbsp; ${boolChk(c.q46, false)}</td>
    </tr>
    <tr>
      <td class="text-center">47</td>
      <td>Feito configuração do banco de dados no HD secundário? (Caso possuir HD secundário)</td>
      <td class="text-center">${boolChk(c.q47, true)} &nbsp; ${boolChk(c.q47, false)}</td>
    </tr>
    <tr>
      <td class="text-center">48</td>
      <td colspan="2">
        <b>Softwares instalados e ativados:</b><br>
        EzDent-i: ${chk(c.q48_ezdenti, 'Floating')} Floating ou ${chk(c.q48_ezdenti, '30dias')} 30dias &nbsp;&nbsp;&nbsp;&nbsp;
        Ez3D-i: ${chk(c.q48_ez3di, 'Floating')} Floating ou ${chk(c.q48_ez3di, '30dias')} 30dias<br>
        Bibl. Consult: ${chk(c.q48_consult, 'Floating')} Floating ou ${chk(c.q48_consult, '30dias')} 30dias &nbsp;&nbsp;&nbsp;&nbsp;
        Bibl. Implant: ${chk(c.q48_implant, 'Floating')} Floating ou ${chk(c.q48_implant, '30dias')} 30dias
      </td>
    </tr>
    <tr>
      <td class="text-center">49</td>
      <td><b>Número Série do Pen Drive:</b> s.n.: <u>${safeText(c.q49_sn, '________________')}</u></td>
      <td>Adicionado mousepad Vatech?<br>${boolChk(c.q49_mousepad, true)} ${boolChk(c.q49_mousepad, false)}</td>
    </tr>
    <tr>
      <td class="text-center">50</td>
      <td>MAC ADDRESS coletado para solicitar licença ? (se necessário) &nbsp; <u>${safeText(c.q50_mac, '')}</u></td>
      <td class="text-center">${boolChk(c.q50, true)} &nbsp; ${boolChk(c.q50, false)}</td>
    </tr>
    <tr>
      <td class="text-center">51</td>
      <td>Foi feito o alinhamento do colimador em todos os modos e FOVs?</td>
      <td class="text-center">${boolChk(c.q51, true)} &nbsp; ${boolChk(c.q51, false)}</td>
    </tr>
    <tr>
      <td class="text-center">52</td>
      <td>A imagem está sendo salva no EzDent-i?</td>
      <td class="text-center">${boolChk(c.q52, true)} &nbsp; ${boolChk(c.q52, false)}</td>
    </tr>
    <tr>
      <td class="text-center">53</td>
      <td>Terá softwares terceiros a serem instalados ? &nbsp; Qual? <u>${safeText(c.q53_qual, '________________')}</u></td>
      <td class="text-center">${boolChk(c.q53, true)} &nbsp; ${boolChk(c.q53, false)}</td>
    </tr>
    <tr>
      <td class="text-center">54</td>
      <td>Foi instalado em PCs Clients ? &nbsp; Quantos? <u>${safeText(c.q54_quantos, '____')}</u></td>
      <td class="text-center">${boolChk(c.q54, true)} &nbsp; ${boolChk(c.q54, false)}</td>
    </tr>
    <tr>
      <td class="text-center">55</td>
      <td colspan="2" style="font-size: 7.2pt;">
        <b>Versões:</b> Win: <u>${safeText(c.v_win, '________')}</u> &nbsp;
        EzServer: <u>${safeText(c.v_ezserver, '________')}</u> &nbsp;
        EzDent-i: <u>${safeText(c.v_ezdenti, '________')}</u> &nbsp;
        CaptureSW: <u>${safeText(c.v_capture, '________')}</u> &nbsp;
        ImplantDB: <u>${safeText(c.v_implantdb, '________')}</u><br>
        Consult: <u>${safeText(c.v_consult, '________')}</u> &nbsp;
        Ez3D-i: <u>${safeText(c.v_ez3di, '________')}</u> &nbsp;
        Fibra Óptica: <u>${safeText(c.v_fibra, '________')}</u>
      </td>
    </tr>

    <!-- CATEGORIA 7: Aquisição de imagem -->
    <tr>
      <td class="text-center">56</td>
      <td rowspan="4" class="text-bold text-center" style="background:#ffffff; font-size: 8pt; line-height: 1.25; vertical-align: middle;">Aquisição<br>de imagem</td>
      <td>Realizado captura de todos os modos de exames?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q56, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q56, false)}</td>
    </tr>
    <tr>
      <td class="text-center">57</td>
      <td>PANO: &nbsp; ${chk(c.q57_std, true)} Standard &nbsp;&nbsp; ${chk(c.q57_orto, true)} Ortogonal Bitewing &nbsp;&nbsp; ${chk(c.q57_atm, true)} ATM Open/Close</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q57, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q57, false)}</td>
    </tr>
    <tr>
      <td class="text-center">58</td>
      <td>CEPH: &nbsp; ${chk(c.q58_lat, true)} Lateral &nbsp; ${chk(c.q58_fulllat, true)} Full Lateral &nbsp; ${chk(c.q58_pa, true)} PA &nbsp; ${chk(c.q58_carpal, true)} Carpal</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q58, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q58, false)}</td>
    </tr>
    <tr>
      <td class="text-center">59</td>
      <td>
        CBCT: &nbsp; ${chk(c.q59_5x5, true)} 5x5 &nbsp; ${chk(c.q59_8x5, true)} 8x5 &nbsp; ${chk(c.q59_8x8, true)} 8x8 &nbsp; ${chk(c.q59_8x9, true)} 8x9 &nbsp; ${chk(c.q59_10x7, true)} 10x7<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(c.q59_10x85, true)} 10x8.5 &nbsp; ${chk(c.q59_12x9, true)} 12x9 &nbsp; ${chk(c.q59_16x9, true)} 16x9 &nbsp; ${chk(c.q59_dscan, true)} Double Scan
      </td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q59, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q59, false)}</td>
    </tr>

    <!-- CATEGORIA 8: Entrega Técnica -->
    <tr>
      <td class="text-center">60</td>
      <td rowspan="4" class="text-bold text-center" style="background:#ffffff; font-size: 8pt; line-height: 1.25; vertical-align: middle;">Entrega<br>Técnica</td>
      <td>Foi realizada entrega técnica?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q60, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q60, false)}</td>
    </tr>
    <tr>
      <td class="text-center">61</td>
      <td colspan="2"><b>Nome dos Participantes:</b> ${safeText(c.q61_participantes, 'Equipe clínica')}</td>
    </tr>
    <tr>
      <td class="text-center">62</td>
      <td>Foi explicado a importância do PenDrive de Licenças e CD/Pendrive de Software?</td>
      <td class="text-center" style="font-size: 7.5pt; white-space: nowrap;">${boolChk(c.q62, true)} &nbsp;&nbsp;&nbsp;&nbsp; ${boolChk(c.q62, false)}</td>
    </tr>
    <tr>
      <td class="text-center">63</td>
      <td colspan="2"><b>Foi entregue para:</b> ${safeText(c.q63_entregue_para, cli.nomeContato)}</td>
    </tr>
  </table>

  <!-- G. ASSINATURA DE CONFIRMAÇÃO DE INSTALAÇÃO COMPLETA -->
  <div class="banner-yellow" style="margin-top: 3px;">G. Assinatura de confirmação de Instalação Completa</div>
  <table style="margin-top: 0;">
    <tr style="background:#ffffff;">
      <td style="width: 50%;"><b>Conferido por (Vatech BR):</b></td>
      <td style="width: 50%;"><b>*Nome Cliente:</b> ${safeText(cli.nomeContato)}</td>
    </tr>
    <tr>
      <td>
        <b>*Nome Instalador:</b> ${safeText(tec.nomeTecnico)}<br>
        <div style="text-align: center; height: 42px;">
          ${sigs.tecnico ? `<img src="${sigs.tecnico}" class="sig-img" alt="Assinatura Técnico" />` : '<div style="color:#9ca3af; padding-top:15px;">(Assinatura)</div>'}
        </div>
      </td>
      <td>
        <br>
        <div style="text-align: center; height: 42px;">
          ${sigs.cliente ? `<img src="${sigs.cliente}" class="sig-img" alt="Assinatura Cliente" />` : '<div style="color:#9ca3af; padding-top:15px;">(Assinatura)</div>'}
        </div>
      </td>
    </tr>
  </table>

  <div class="footer-confidential">
    Copyright © 2022 VATECH Networks | All Rights Reserved. / Confidential
  </div>
  </div> <!-- fim da checklist-frame da Folha 2 -->

</body>
</html>`;
}

/**
 * ============================================================================
 * 2. RELATÓRIO DE ATENDIMENTO AO CLIENTE (VISITA TÉCNICA)
 * ============================================================================
 */
function gerarHtmlRelatorio(dados, rel, sigs) {
  rel = rel || {};
  sigs = sigs || {};
  dados = dados || {};
  const cli = dados.cliente || {};
  const eq = dados.equipamento || {};
  const tec = dados.tecnico || {};

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${PDF_GLOBAL_STYLE}</style>
</head>
<body>

  <!-- TOPO: LOGO E ENDEREÇO DA VATECH BRASIL -->
  <table>
    <tr>
      <td style="width: 40%; border: none; vertical-align: middle;">
        <img src="${VATECH_LOGO_BASE64}" style="height: 30px; width: auto;" alt="Vatech" />
      </td>
      <td style="width: 60%; border: none; text-align: right; font-size: 7.5pt; line-height: 1.3;">
        <b>Vatech Brasil</b><br>
        Rua Aureliano Guimarães, 172 CJ 1010<br>
        Vila Andrade, São Paulo – SP<br>
        +55 (11) 2365-7154 / 2365-7167<br>
        CNPJ: 14.429.382/0001-88 &nbsp; Insc. Est: 146.587.478.116
      </td>
    </tr>
  </table>

  <div style="margin-top: 10px; margin-bottom: 8px; border: 1.5px solid #000; padding: 4px; text-align: center;">
    <div style="font-size: 11pt; font-weight: bold;">RELATÓRIO DE ATENDIMENTO AO CLIENTE</div>
    <table style="border:none; margin-top: 3px;">
      <tr>
        <td style="border:none; width: 45%; font-size: 10.5pt; font-weight: bold; text-align: left;">VISITA TÉCNICA</td>
        <td style="border:none; width: 25%; font-size: 9pt; text-align: center;">rev 02</td>
        <td style="border:none; width: 30%; font-size: 9pt; font-weight: bold; text-align: right;">nº ${safeText(dados.idAtendimento)}</td>
      </tr>
    </table>
  </div>

  <!-- DADOS GERAIS -->
  <div class="banner-gray" style="text-align: center;">Dados Gerais</div>
  <table>
    <tr>
      <td style="width: 15%; font-weight: bold;">CLIENTE:</td>
      <td colspan="3" style="font-weight: bold;">${safeText(cli.razaoSocial)}</td>
    </tr>
    <tr>
      <td style="font-weight: bold;">EQUIPAMENTO:</td>
      <td style="width: 35%;">${safeText(eq.modelo || 'PaX-i')}</td>
      <td style="width: 15%; font-weight: bold;">n. Série:</td>
      <td style="width: 35%; font-weight: bold;">${safeText(eq.nSerie)}</td>
    </tr>
    <tr>
      <td style="font-weight: bold;">ENDEREÇO:</td>
      <td>${safeText(cli.endereco)}</td>
      <td style="font-weight: bold;">Cidade / UF:</td>
      <td>${safeText(cli.cidadeUf)}</td>
    </tr>
    <tr>
      <td style="font-weight: bold;">CONTATO:</td>
      <td>${safeText(cli.nomeContato)}</td>
      <td style="font-weight: bold;">TEL:</td>
      <td>${safeText(cli.telefone)}</td>
    </tr>
    <tr>
      <td style="font-weight: bold;">Período :</td>
      <td colspan="3">
        Horario inicial: <b>${safeText(rel.horaInicial, '____:____')}</b> &nbsp;&nbsp;&nbsp; Data: <b>${safeText(rel.dataInicial, formatBrDate(new Date()))}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        Horario Final: <b>${safeText(rel.horaFinal, '____:____')}</b> &nbsp;&nbsp;&nbsp; Data: <b>${safeText(rel.dataFinal, formatBrDate(new Date()))}</b>
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold;">Motivo:</td>
      <td>${safeText(rel.motivo || 'INSTALAÇÃO DE EQUIPAMENTO')}</td>
      <td style="font-weight: bold;">Garantia:</td>
      <td>${safeText(eq.anosGarantia || '5')} Anos</td>
    </tr>
  </table>

  <!-- DESCRIÇÃO TÉCNICA -->
  <div class="banner-gray" style="margin-top: 4px;">Descrição:</div>
  <table style="margin-top: 0;">
    <tr>
      <td style="height: 180px; min-height: 140px; vertical-align: top; font-size: 8pt; line-height: 1.3; padding: 6px;">
        ${safeText(rel.descricaoTecnica, '').replace(/\n/g, '<br>')}
      </td>
    </tr>
  </table>

  <!-- DATA E DECLARAÇÃO -->
  <table style="margin-top: 6px;">
    <tr>
      <td style="border: none; padding: 2px 0; font-size: 8.5pt;">
        <b>Data:</b> ${formatBrDate(new Date())}
      </td>
    </tr>
    <tr>
      <td style="border: none; padding: 2px 0; font-size: 8pt; font-style: italic;">
        Confirmo que constatei o adequado funcionamento do equipamento após serviço técnico prestado.
      </td>
    </tr>
  </table>

  <!-- ASSINATURAS -->
  <table style="margin-top: 8px;">
    <tr>
      <td style="width: 50%; height: 62px; vertical-align: bottom;">
        <div style="text-align: center; margin-bottom: 2px;">
          ${sigs.cliente ? `<img src="${sigs.cliente}" class="sig-img" style="max-height: 44px;" alt="Assinatura Cliente" />` : ''}
        </div>
        <div style="border-top: 1px solid #000; padding-top: 2px;">
          <b>Assinatura do cliente</b><br>
          <b>Nome:</b> ${safeText(cli.nomeContato)}
        </div>
      </td>
      <td style="width: 50%; height: 62px; vertical-align: bottom;">
        <div style="text-align: center; margin-bottom: 2px;">
          ${sigs.tecnico ? `<img src="${sigs.tecnico}" class="sig-img" style="max-height: 44px;" alt="Assinatura Técnico" />` : ''}
        </div>
        <div style="border-top: 1px solid #000; padding-top: 2px;">
          <b>Assinatura do Técnico</b><br>
          <b>Nome:</b> ${safeText(tec.nomeTecnico)}
        </div>
      </td>
    </tr>
  </table>

  <div class="footer-confidential" style="margin-top: 10px;">
    Copyright © 2022 VATECH Networks | All Rights Reserved. / Confidential
  </div>

</body>
</html>`;
}

/**
 * ============================================================================
 * 3. CERTIFICADO DE GARANTIA (Termo de Garantia)
 * ============================================================================
 */
function gerarHtmlGarantia(dados, gar, sigs) {
  gar = gar || {};
  sigs = sigs || {};
  dados = dados || {};
  const cli = dados.cliente || {};
  const eq = dados.equipamento || {};
  const tec = dados.tecnico || {};

  const dataInicio = dados.dataCriacao || new Date().toISOString().slice(0, 10);
  let dataTermino = '';
  try {
    const d = new Date(dataInicio);
    const anos = parseInt(eq.anosGarantia || 5, 10);
    d.setFullYear(d.getFullYear() + anos);
    d.setDate(d.getDate() - 1);
    dataTermino = d.toISOString().slice(0, 10);
  } catch (e) {
    dataTermino = '2031-09-29';
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${PDF_GLOBAL_STYLE}</style>
</head>
<body>

  <!-- TOPO: LOGO E ENDEREÇO DA VATECH BRASIL -->
  <table>
    <tr>
      <td style="width: 35%; border: none; vertical-align: middle;">
        <img src="${VATECH_LOGO_BASE64}" style="height: 32px; width: auto;" alt="Vatech" />
      </td>
      <td style="width: 65%; border: none; text-align: right; font-size: 7.2pt; line-height: 1.25;">
        <b>n. ${safeText(dados.idAtendimento)}</b><br>
        <b>Vatech Brasil</b><br>
        Rua Aureliano Guimarães, 172 CJ 1010<br>
        Vila Andrade, São Paulo – SP<br>
        +55 (11) 2365-7154 / 2365-7167<br>
        CNPJ: 14.429.382/0001-88 &nbsp; Insc. Est: 146.587.478.116
      </td>
    </tr>
  </table>

  <!-- TÍTULO -->
  <div style="margin-top: 6px; margin-bottom: 5px; border: 1.5px solid #000; padding: 3px; text-align: center;">
    <table style="border:none;">
      <tr>
        <td style="border:none; width: 80%; font-size: 11pt; font-weight: bold; text-align: center;">CERTIFICADO DE GARANTIA</td>
        <td style="border:none; width: 20%; font-size: 9pt; text-align: right;">rev.02</td>
      </tr>
    </table>
  </div>

  <!-- TABELAS EQUIPAMENTO E TÉCNICO -->
  <table>
    <tr style="background:#f3f4f6;">
      <td colspan="2" style="width: 65%; font-weight: bold;">Equipamento e Número de serie</td>
      <td style="width: 35%; font-weight: bold;">Numero da nota fiscal</td>
    </tr>
    <tr>
      <td style="width: 25%; font-weight: bold;">${safeText(eq.modelo || 'PaX-i')}</td>
      <td style="width: 40%;"><b>n. Série:</b> ${safeText(eq.nSerie)}</td>
      <td>${safeText(eq.notaFiscal || '16208')}</td>
    </tr>
    <tr style="background:#f3f4f6;">
      <td colspan="2" style="font-weight: bold;">Nome do Técnico</td>
      <td style="font-weight: bold;">Assinatura do Técnico</td>
    </tr>
    <tr>
      <td colspan="2">${safeText(tec.nomeTecnico)}</td>
      <td style="text-align: center; height: 35px;">
        ${sigs.tecnico ? `<img src="${sigs.tecnico}" class="sig-img" alt="Assinatura Técnico" />` : ''}
      </td>
    </tr>
  </table>

  <!-- DADOS DO CLIENTE -->
  <div class="banner-gray" style="margin-top: 4px; text-align: center;">Dados do Cliente</div>
  <table style="margin-top: 0;">
    <tr>
      <td style="text-align: center; font-weight: bold; font-size: 8.5pt; padding: 4px;">
        ${safeText(cli.razaoSocial)}
      </td>
    </tr>
  </table>

  <!-- PRAZOS DE GARANTIA -->
  <table style="margin-top: 3px;">
    <tr style="background:#f3f4f6; font-weight: bold; text-align: center;">
      <td style="width: 20%;">Garantia</td>
      <td style="width: 25%;">Cidade</td>
      <td style="width: 27%;">Data início de Garantia</td>
      <td style="width: 28%;">Data de término de Garantia</td>
    </tr>
    <tr style="text-align: center;">
      <td style="font-weight: bold;">${safeText(eq.anosGarantia || '5')} Anos Total</td>
      <td>${safeText(cli.cidadeUf)}</td>
      <td>${safeText(dataInicio)}</td>
      <td style="font-weight: bold;">${safeText(dataTermino)}</td>
    </tr>
  </table>

  <!-- TERMOS E CONDIÇÕES LEGAIS -->
  <div class="banner-gray" style="margin-top: 3px; text-align: center;">Termos/Condições de Garantia</div>
  <table style="margin-top: 0;">
    <tr>
      <td style="font-size: 6.5pt; line-height: 1.16; padding: 2.5px 5px; text-align: justify;">
        Os atributos e aspectos gerais desta garantia terão validade e serão estabelecidos mediante ao firmamento do instalador e o cliente na data de instalação.<br><br>
        • A garantia no equipamento será prestada pelo período descrito no contrato de compra do equipamento, iniciando esse período pela data de instalação desde que as irregularidades apresentadas demonstrem sua origem em função do uso correto do equipamento.<br>
        • A garantia do computador e monitor (quando adquirido junto à Vatech) será prestada por 1 ano (12 meses), iniciando esse período pela data de instalação desde que as irregularidades apresentadas demonstrem sua origem em função do uso correto do computador e monitor.<br>
        • A garantia não será prestada em caso de fenômenos meteorológicos, tais como ocorrência de raios e descargas elétricas que venham a atingir a rede elétrica, de telefonia ou de dados da clínica.<br>
        • A garantia não será coberta em danos no equipamento ocasionados por incêndio, furtos ou vandalismo, alagamento e depredações no estabelecimento onde o equipamento foi instalado.<br>
        • No período de garantia estão cobertos os seguintes itens: Placas eletrônicas, sensores, cabeçote, cabos em geral e motores em geral.<br>
        • A calibração e a manutenção do equipamento estão cobertas pela garantia, desde que o equipamento não apresente aspectos de impacto, rompimento de lacres de segurança, violação das partes ou tentativa de manutenção por pessoas não autorizadas;<br>
        • A garantia não será coberta caso a embalagem do equipamento fora aberta por uma pessoa não autorizada pela equipe responsável da fábrica ou os equipamentos forem manipulados por pessoa não autorizada e não credenciada a rede autorizada e sem o treinamento adequado para a realização da instalação do produto;<br>
        • A garantia não será coberta caso o computador de aquisição do equipamento apresente programas indevidos, tais como vírus, programas de spam, música, redes sociais, e-mails pessoais e softwares instalados sem a autorização da equipe responsável da fábrica pelo setor de pós-venda.<br>
        • A garantia não cobre defeitos físicos no computador de aquisição, causados por danos, impactos, manuseio incorreto e uso indevido.<br>
        • A garantia não cobre defeitos lógicos, formatação e reinstalação dos softwares do equipamento no computador de aquisição.<br>
        • Após o término da garantia, o acesso remoto da fábrica será cobrado por hora, mediante ao valor estipulado pela fábrica.<br>
        • A garantia não cobre a perda de quaisquer dados do computador de aquisição.<br>
        • O equipamento possui um período de até 60 dias para que seu funcionamento fique totalmente correto e operante, em virtude das adequações e integrações com outros componentes que a clínica utiliza.<br>
        • A garantia do equipamento não é coberta caso o equipamento demonstre avarias, riscos, amassados e demais aspectos de danificação física, como queda, impactos, e qualquer tipo de uso indevido.<br>
        • A chave de licença dos softwares não terá garantia em caso de perda, roubo, extravios em geral e indícios de danificações físicas.<br>
        • A garantia não cobrirá os equipamentos e produtos que forem utilizados de forma inadequada ou que depois de instalados forem transportados ou reinstalados em outro local;
      </td>
    </tr>
  </table>

  <!-- DECLARAÇÃO DE ACEITE E ASSINATURA CLIENTE -->
  <table style="margin-top: 4px;">
    <tr>
      <td style="padding: 4px 6px;">
        <div style="font-size: 7.8pt; margin-bottom: 2px;">
          EU <b>${safeText(cli.nomeContato)}</b> declaro estar de acordo com os termos citados, Assinatura e Carimbo
        </div>
        <div style="text-align: center; height: 40px; margin-top: 2px;">
          ${sigs.cliente ? `<img src="${sigs.cliente}" class="sig-img" style="max-height: 38px;" alt="Assinatura Cliente" />` : ''}
        </div>
        <div style="text-align: center; border-top: 1px solid #000; width: 65%; margin: 0 auto; padding-top: 2px; font-size: 7.2pt;">
          ${safeText(cli.nomeContato)} - ${safeText(cli.razaoSocial)}
        </div>
      </td>
    </tr>
  </table>

  <div class="footer-confidential" style="margin-top: 4px;">
    Copyright © 2022 VATECH Networks | All Rights Reserved. / Confidential
  </div>

</body>
</html>`;
}

/**
 * ============================================================================
 * 4. FEEDBACK DO CLIENTE
 * ============================================================================
 */
function gerarHtmlFeedback(dados, fb, sigs) {
  fb = fb || {};
  sigs = sigs || {};
  dados = dados || {};
  
  // Normaliza fb para aceitar tanto com prefixo "fb_" quanto com nome direto
  const normFb = {
    q1_opiniao: fb.q1_opiniao || fb.fb_q1_opiniao || '',
    q2_inicio: fb.q2_inicio || fb.fb_q2_inicio || '',
    q2_sagital: fb.q2_sagital || fb.fb_q2_sagital || '',
    q2_frankfurt: fb.q2_frankfurt || fb.fb_q2_frankfurt || '',
    q2_canino: fb.q2_canino || fb.fb_q2_canino || '',
    q2_lingua: fb.q2_lingua || fb.fb_q2_lingua || '',
    q2_pes: fb.q2_pes || fb.fb_q2_pes || '',
    q2_posicionadores: fb.q2_posicionadores || fb.fb_q2_posicionadores || '',
    q2_colete: fb.q2_colete || fb.fb_q2_colete || '',
    q3_paciente: fb.q3_paciente || fb.fb_q3_paciente || '',
    q3_aquisicao: fb.q3_aquisicao || fb.fb_q3_aquisicao || '',
    q3_visualizador: fb.q3_visualizador || fb.fb_q3_visualizador || '',
    q3_consulta: fb.q3_consulta || fb.fb_q3_consulta || '',
    q3_implante: fb.q3_implante || fb.fb_q3_implante || '',
    q3_relatorio: fb.q3_relatorio || fb.fb_q3_relatorio || '',
    q3b_mpr: fb.q3b_mpr || fb.fb_q3b_mpr || '',
    q3b_secao: fb.q3b_secao || fb.fb_q3b_secao || '',
    q3b_3dpan: fb.q3b_3dpan || fb.fb_q3b_3dpan || '',
    q3b_tmj: fb.q3b_tmj || fb.fb_q3b_tmj || '',
    q3b_implante: fb.q3b_implante || fb.fb_q3b_implante || '',
    q3b_consulta: fb.q3b_consulta || fb.fb_q3b_consulta || '',
    q3b_relatorio: fb.q3b_relatorio || fb.fb_q3b_relatorio || '',
    q4: fb.fb_q4 || fb.q4 || '',
    q5: fb.fb_q5 || fb.q5 || '',
    q5_quantos: fb.fb_q5_quantos || fb.q5_quantos || '',
    q6: fb.fb_q6 || fb.q6 || '',
    q7: fb.fb_q7 || fb.q7 || '',
    expTreinamento: fb.fbExpTreinamento || fb.expTreinamento || '',
    expEntrega: fb.fbExpEntrega || fb.expEntrega || ''
  };
  fb = Object.assign({}, fb, normFb);

  const cli = dados.cliente || {};
  const eq = dados.equipamento || {};
  const tec = dados.tecnico || {};

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${PDF_GLOBAL_STYLE}</style>
</head>
<body>

  <!-- TOPO: LOGO E TÍTULO -->
  <table style="margin-bottom: 2px;">
    <tr>
      <td style="width: 25%; border: none; vertical-align: middle;">
        <img src="${VATECH_LOGO_BASE64}" style="height: 24px; width: auto;" alt="Vatech" />
      </td>
      <td style="width: 75%; border: none; text-align: center; vertical-align: middle;">
        <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px;">Feedback cliente</div>
      </td>
    </tr>
  </table>

  <!-- CABEÇALHO TÉCNICO -->
  <table style="margin-bottom: 2px;">
    <tr>
      <td style="width: 14%;" class="bg-header-blue">Data de</td>
      <td style="width: 18%;" class="bg-header-white text-center">${safeText(dados.dataCriacao || formatBrDate(new Date()))}</td>
      <td style="width: 12%;" class="bg-header-blue">Técnico</td>
      <td style="width: 26%;" class="bg-header-white text-center">${safeText(tec.nomeTecnico)}</td>
      <td style="width: 10%;" class="bg-header-blue">Empresa</td>
      <td style="width: 20%;" class="bg-header-white text-center">${safeText(tec.empresa || 'EXACTA MANUTENCOES')}</td>
    </tr>
  </table>

  <!-- 1. INFORMAÇÕES DO CLIENTE -->
  <div class="banner-yellow">1. Informações do Cliente</div>
  <table style="margin-bottom: 2px;">
    <tr>
      <td style="width: 14%;" class="bg-header-blue">Local/ Clínica</td>
      <td style="width: 50%;" class="bg-header-white">${safeText(cli.razaoSocial)}</td>
      <td style="width: 10%;" class="bg-header-blue">Cliente</td>
      <td style="width: 26%;" class="bg-header-white">${safeText(cli.nomeContato)}</td>
    </tr>
    <tr>
      <td class="bg-header-blue">Endereço</td>
      <td colspan="3" class="bg-header-white">${safeText(cli.endereco)}</td>
    </tr>
    <tr>
      <td class="bg-header-blue">Nº Contato</td>
      <td class="bg-header-white" style="color:#000000 !important; text-decoration:none;">${safeText(cli.telefone)}</td>
      <td class="bg-header-blue">Cidade/ UF</td>
      <td class="bg-header-white">${safeText(cli.cidadeUf)}</td>
    </tr>
  </table>

  <!-- 2. INFORMAÇÕES DO EQUIPAMENTO -->
  <div class="banner-yellow">2. Informações do Equipamento</div>
  <table style="margin-bottom: 2px;">
    <tr>
      <td style="width: 14%;" class="bg-header-blue">Equipamento</td>
      <td style="width: 40%;" class="bg-header-white">${safeText(eq.modelo || 'PaX-i')}</td>
      <td style="width: 12%;" class="bg-header-white text-center">n. Série:</td>
      <td style="width: 34%;" class="bg-header-white" style="color:#000000 !important; font-weight:normal;">${safeText(eq.nSerie)}</td>
    </tr>
  </table>

  <!-- AVALIAÇÃO DO TREINAMENTO -->
  <div class="banner-yellow">Avaliação do treinamento pós instalação</div>
  <table>
    <tr style="background:#ffffff; font-weight: bold;">
      <th style="width: 5%; text-align: center; background:#ffffff;">Nº</th>
      <th style="width: 65%; background:#ffffff;">Questão</th>
      <th style="width: 30%; text-align: center; background:#ffffff;">Avaliação</th>
    </tr>

    <!-- ITEM 1 -->
    <tr>
      <td class="text-center">1</td>
      <td><b>Qual sua opinião sobre o treinamento em geral?</b></td>
      <td class="text-center" style="font-size: 7.5pt;">
        ${chk(fb.q1_opiniao, 'Otimo')} Ótimo &nbsp;
        ${chk(fb.q1_opiniao, 'Bom')} Bom &nbsp;
        ${chk(fb.q1_opiniao, 'Neutro')} Neutro &nbsp;
        ${chk(fb.q1_opiniao, 'Ruim')} Ruim &nbsp;
        ${chk(fb.q1_opiniao, 'Pessimo')} Péssimo
      </td>
    </tr>

    <!-- ITEM 2: POSICIONAMENTO -->
    <tr>
      <td class="text-center" rowspan="8">2</td>
      <td rowspan="8">
        <b>Sobre os processos de posicionamento, foram citados e orientados pelo técnico?</b>
      </td>
      <td>Processo de início do exame - Confirm/Ready: &nbsp; ${chk(fb.q2_inicio, 'SIM')} Sim &nbsp; ${chk(fb.q2_inicio, 'NAO')} Não</td>
    </tr>
    <tr><td>Laser vertical - Sagital: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q2_sagital, 'SIM')} Sim &nbsp; ${chk(fb.q2_sagital, 'NAO')} Não</td></tr>
    <tr><td>Laser horizontal - Frankfurt: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q2_frankfurt, 'SIM')} Sim &nbsp; ${chk(fb.q2_frankfurt, 'NAO')} Não</td></tr>
    <tr><td>Laser do canino: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q2_canino, 'SIM')} Sim &nbsp; ${chk(fb.q2_canino, 'NAO')} Não</td></tr>
    <tr><td>Língua no céu da boca: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q2_lingua, 'SIM')} Sim &nbsp; ${chk(fb.q2_lingua, 'NAO')} Não</td></tr>
    <tr><td>Pés levemente posicionados a frente: &nbsp; ${chk(fb.q2_pes, 'SIM')} Sim &nbsp; ${chk(fb.q2_pes, 'NAO')} Não</td></tr>
    <tr><td>Posicionadores (Ex:Mordedor e apoio de queixo): &nbsp; ${chk(fb.q2_posicionadores, 'SIM')} Sim &nbsp; ${chk(fb.q2_posicionadores, 'NAO')} Não</td></tr>
    <tr><td>Colete de chumbo: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q2_colete, 'SIM')} Sim &nbsp; ${chk(fb.q2_colete, 'NAO')} Não</td></tr>

    <!-- ITEM 3: EZDENT-I -->
    <tr>
      <td class="text-center" rowspan="6">3</td>
      <td rowspan="6">
        <b>Sobre o software EzDent-i, foi explicado sobre as abas de uso e ferramentas?</b>
      </td>
      <td>Paciente: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3_paciente, 'SIM')} Sim &nbsp; ${chk(fb.q3_paciente, 'NAO')} Não</td>
    </tr>
    <tr><td>Aquisição: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3_aquisicao, 'SIM')} Sim &nbsp; ${chk(fb.q3_aquisicao, 'NAO')} Não</td></tr>
    <tr><td>Visualizador: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3_visualizador, 'SIM')} Sim &nbsp; ${chk(fb.q3_visualizador, 'NAO')} Não</td></tr>
    <tr><td>Consulta: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3_consulta, 'SIM')} Sim &nbsp; ${chk(fb.q3_consulta, 'NAO')} Não</td></tr>
    <tr><td>Implante: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3_implante, 'SIM')} Sim &nbsp; ${chk(fb.q3_implante, 'NAO')} Não</td></tr>
    <tr><td>Relatório (Templates): ${chk(fb.q3_relatorio, 'SIM')} Sim &nbsp; ${chk(fb.q3_relatorio, 'NAO')} Não</td></tr>

    <!-- ITEM 3: EZ3D-I -->
    <tr>
      <td class="text-center" rowspan="7">3</td>
      <td rowspan="7">
        <b>Sobre o software Ez3D-i, foi explicado sobre as abas de uso e ferramentas?</b> <i>(Caso seja equipamento 3D)</i>
      </td>
      <td>MPR: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3b_mpr, 'SIM')} Sim &nbsp; ${chk(fb.q3b_mpr, 'NAO')} Não</td>
    </tr>
    <tr><td>Seção: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3b_secao, 'SIM')} Sim &nbsp; ${chk(fb.q3b_secao, 'NAO')} Não</td></tr>
    <tr><td>3D Pan: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3b_3dpan, 'SIM')} Sim &nbsp; ${chk(fb.q3b_3dpan, 'NAO')} Não</td></tr>
    <tr><td>TMJ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3b_tmj, 'SIM')} Sim &nbsp; ${chk(fb.q3b_tmj, 'NAO')} Não</td></tr>
    <tr><td>Implante: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3b_implante, 'SIM')} Sim &nbsp; ${chk(fb.q3b_implante, 'NAO')} Não</td></tr>
    <tr><td>Consulta: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${chk(fb.q3b_consulta, 'SIM')} Sim &nbsp; ${chk(fb.q3b_consulta, 'NAO')} Não</td></tr>
    <tr><td>Relatório (Templates): ${chk(fb.q3b_relatorio, 'SIM')} Sim &nbsp; ${chk(fb.q3b_relatorio, 'NAO')} Não</td></tr>

    <!-- ITEM 4 -->
    <tr>
      <td class="text-center">4</td>
      <td>O kit de acessórios (Manuais, pendrives, barras de transporte, etc.) foram entregues pelo técnico para serem armazenados junto ao restante dos itens do equipamento?</td>
      <td class="text-center">${chk(fb.q4, 'SIM')} Sim &nbsp;&nbsp; ${chk(fb.q4, 'NAO')} Não</td>
    </tr>

    <!-- ITEM 5 -->
    <tr>
      <td class="text-center">5</td>
      <td>Há outros computadores que gostaria de instalar os softwares para visualização dos exames? Se sim, quantos são? <u>${safeText(fb.q5_quantos, '____')}</u></td>
      <td class="text-center">${chk(fb.q5, 'SIM')} Sim &nbsp;&nbsp; ${chk(fb.q5, 'NAO')} Não</td>
    </tr>

    <!-- ITEM 6 -->
    <tr>
      <td class="text-center">6</td>
      <td>Foi explicado pelo técnico sobre a rede de internet do local para comunicação das estações de visualização?</td>
      <td class="text-center">${chk(fb.q6, 'SIM')} Sim &nbsp;&nbsp; ${chk(fb.q6, 'NAO')} Não</td>
    </tr>

    <!-- ITEM 7 -->
    <tr>
      <td class="text-center">7</td>
      <td>Foi deixado os guias digitais de posicionamento e acessórios na área de trabalho do PC de aquisição?</td>
      <td class="text-center">${chk(fb.q7, 'SIM')} Sim &nbsp;&nbsp; ${chk(fb.q7, 'NAO')} Não</td>
    </tr>

    <!-- ITEM 8: AVISO CIENTÍFICO 3D -->
    <tr>
      <td class="text-center">8</td>
      <td style="font-size: 7.2pt; line-height: 1.25;">
        O treinamento com nossos especialistas científicos será agendado pela equipe Vatech após um período de mais ou menos 30 dias após a instalação, caso maiores dúvidas entre em contato com nosso suporte.<br>
        <b>(TREINAMENTO EXCLUSIVO PARA EQUIPAMENTOS 3D)</b>
      </td>
      <td style="font-size: 7pt; line-height: 1.25;">
        <b>Contatos suporte Vatech:</b><br>
        Whatsapp: (011) 9 6401-0294<br>
        Telefone: (011) 2189-0774<br>
        Email: vbrg0200@vatechglobal.com
      </td>
    </tr>
  </table>

  <!-- QUEBRA DE PÁGINA OBRIGATÓRIA: FIM DA FOLHA 1 DO FEEDBACK (PERGUNTAS 1 A 8) -->
  <div class="page-break-always" style="page-break-after: always; break-after: page;"></div>

  <!-- FOLHA 2 DO FEEDBACK: DISSERTAÇÕES E ASSINATURAS (SEQUENCIAIS NA MESMA FOLHA, SEM CORTES) -->
  <div style="margin-top: 4px; font-weight: bold; font-size: 7.5pt;">Descreva sua experiência referente ao treinamento aplicado:</div>
  <table>
    <tr>
      <td style="height: 50px; vertical-align: top; font-size: 7.5pt;">
        ${safeMultilineText(fb.expTreinamento, '')}
      </td>
    </tr>
  </table>

  <div style="margin-top: 6px; font-weight: bold; font-size: 7.5pt;">Descreva sua experiência referente ao processo de entrega do equipamento, desde o contato para recebimento da máquina até a instalação:</div>
  <table>
    <tr>
      <td style="height: 50px; vertical-align: top; font-size: 7.5pt;">
        ${safeMultilineText(fb.expEntrega, '')}
      </td>
    </tr>
  </table>

  <!-- ASSINATURAS TREINAMENTO COMPLETO (SEQUENCIAIS NA MESMA FOLHA) -->
  <div class="banner-yellow" style="margin-top: 8px;">Assinatura de treinamento completo</div>
  <table style="margin-top: 0;">
    <tr style="background:#fafafa;">
      <td style="width: 50%;"><b>Conferido por (Vatech BR):</b></td>
      <td style="width: 50%;"><b>*Nome Cliente:</b> ${safeText(cli.nomeContato)}</td>
    </tr>
    <tr>
      <td>
        <b>*Nome Instalador:</b> ${safeText(tec.nomeTecnico)}<br>
        <div style="text-align: center; height: 50px;">
          ${sigs.tecnico ? `<img src="${sigs.tecnico}" class="sig-img" style="max-height: 46px;" alt="Assinatura Técnico" />` : '<div style="color:#9ca3af; padding-top:15px;">(Assinatura)</div>'}
        </div>
      </td>
      <td>
        <br>
        <div style="text-align: center; height: 50px;">
          ${sigs.cliente ? `<img src="${sigs.cliente}" class="sig-img" style="max-height: 46px;" alt="Assinatura Cliente" />` : '<div style="color:#9ca3af; padding-top:15px;">(Assinatura)</div>'}
        </div>
      </td>
    </tr>
  </table>

  <div class="footer-confidential" style="margin-top: 10px;">
    Copyright © 2022 VATECH Networks | All Rights Reserved. / Confidential
  </div>

</body>
</html>`;
}

/**
 * ============================================================================
 * 5. ANEXO DE EVIDÊNCIAS FOTOGRÁFICAS DE CAMPO COM CARIMBO GPS E DATA/HORA
 * ============================================================================
 */
function gerarHtmlAnexoFotos(dados, fotos, sigs) {
  fotos = fotos || {};
  sigs = sigs || {};
  dados = dados || {};
  const cli = dados.cliente || {};
  const eq = dados.equipamento || {};
  const tec = dados.tecnico || {};

  const listaFotos = [
    { key: 'foto_q22', itemNum: 'Item 22', titulo: 'Etiqueta do Número de Série (Coluna do Equipamento)', desc: 'Registro fotográfico obrigatório da placa de identificação e número de série afixada na coluna do equipamento.' },
    { key: 'foto_q24', itemNum: 'Item 24', titulo: 'Cabo de Energia do Equipamento (Power Cord)', desc: 'Registro fotográfico obrigatório do cabo de força e conexão de alimentação elétrica do equipamento.' },
    { key: 'foto_q36b', itemNum: 'Item 36b', titulo: 'Reforço Preventivo do Cabo do Sensor Pan/Tomo (A9)', desc: 'Registro fotográfico do reforço mecânico preventivo no cabeamento do sensor (exclusivo para modelos A9).' },
    { key: 'foto_extra', itemNum: 'Passo 3', titulo: 'Registro Fotográfico Adicional da Instalação', desc: 'Registro fotográfico geral do ambiente, sala de exames ou equipamento finalizado em operação.' }
  ];

  const fotosCompletas = listaFotos.filter(f => fotos[f.key] && fotos[f.key].dataUrl);

  let htmlFotos = '';
  if (fotosCompletas.length === 0) {
    htmlFotos = `
      <div style="border: 1.5px dashed #9ca3af; padding: 25px; text-align: center; border-radius: 6px; margin: 20px 0; background: #f9fafb;">
        <div style="font-size: 11pt; font-weight: bold; color: #4b5563; margin-bottom: 6px;">Nenhum registro fotográfico foi anexado</div>
        <div style="font-size: 8.5pt; color: #6b7280;">Os registros com câmera ou upload de fotos com geolocalização e data/hora são preenchidos no checklist.</div>
      </div>
    `;
  } else {
    htmlFotos = fotosCompletas.map((item) => {
      const f = fotos[item.key];
      return `
        <div style="page-break-inside: avoid; margin-bottom: 12px; border: 1.5px solid #000; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #e5e7eb;">
              <td colspan="2" style="padding: 4px 6px; border-bottom: 1.5px solid #000; font-size: 8.5pt; font-weight: bold;">
                📸 ${item.itemNum}: ${item.titulo}
              </td>
            </tr>
            <tr>
              <td style="width: 58%; padding: 6px; text-align: center; vertical-align: middle; background: #0f172a; border-right: 1.5px solid #000;">
                <img src="${f.dataUrl}" style="max-width: 100%; max-height: 235px; display: block; margin: 0 auto; border-radius: 3px;" alt="${item.titulo}" />
              </td>
              <td style="width: 42%; padding: 8px; vertical-align: top; font-size: 7.5pt; line-height: 1.35;">
                <div style="font-weight: bold; font-size: 8pt; color: #065f46; margin-bottom: 5px;">
                  🛡️ EVIDÊNCIA TÉCNICA AUTENTICADA
                </div>
                <div style="margin-bottom: 6px;">
                  <b>Descrição do Item:</b><br>${item.desc}
                </div>
                <div style="margin-bottom: 5px; padding: 4px; background: #f3f4f6; border-left: 3px solid #2563eb;">
                  <b>📅 Data e Hora da Captura:</b><br>
                  <span>${safeText(f.dataHoraStr, 'Não informada')}</span>
                </div>
                <div style="margin-bottom: 5px; padding: 4px; background: #f3f4f6; border-left: 3px solid #059669;">
                  <b>📍 Localização Geográfica (GPS):</b><br>
                  <span>${safeText(f.localStr, 'Local da OS')}</span>
                </div>
                <div style="margin-top: 6px; font-size: 6.8pt; color: #4b5563;">
                  Carimbo de autenticidade gravado indelevelmente na imagem através de geolocalização e relógio de alta precisão.
                </div>
              </td>
            </tr>
          </table>
        </div>
      `;
    }).join('');
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${PDF_GLOBAL_STYLE}</style>
</head>
<body>

  <!-- TOPO: LOGO E ENDEREÇO DA VATECH BRASIL -->
  <table>
    <tr>
      <td style="width: 40%; border: none; vertical-align: middle;">
        <img src="${VATECH_LOGO_BASE64}" style="height: 30px; width: auto;" alt="Vatech" />
      </td>
      <td style="width: 60%; border: none; text-align: right; font-size: 7.5pt; line-height: 1.3;">
        <b>Vatech Brasil</b><br>
        Rua Aureliano Guimarães, 172 CJ 1010<br>
        Vila Andrade, São Paulo – SP<br>
        +55 (11) 2365-7154 / 2365-7167<br>
        CNPJ: 14.429.382/0001-88 &nbsp; Insc. Est: 146.587.478.116
      </td>
    </tr>
  </table>

  <div style="margin-top: 8px; margin-bottom: 8px; border: 1.5px solid #000; padding: 4px; text-align: center;">
    <div style="font-size: 11pt; font-weight: bold;">ANEXO DE EVIDÊNCIAS FOTOGRÁFICAS DE CAMPO</div>
    <div style="font-size: 8pt; color: #374151; margin-top: 2px;">REGISTRO TÉCNICO OFICIAL COM CARIMBO DE DATA, HORA E GEOLOCALIZAÇÃO (GPS)</div>
  </div>

  <!-- DADOS DA INSTALAÇÃO -->
  <table style="margin-bottom: 10px;">
    <tr>
      <td style="width: 15%;" class="banner-gray">CLIENTE:</td>
      <td style="width: 45%; font-weight: bold;">${safeText(cli.razaoSocial)}</td>
      <td style="width: 15%;" class="banner-gray">ORDEM SERV.:</td>
      <td style="width: 25%; font-weight: bold;">${safeText(dados.idAtendimento)}</td>
    </tr>
    <tr>
      <td class="banner-gray">EQUIPAMENTO:</td>
      <td><b>${safeText(eq.modelo)}</b> (S/N: <b>${safeText(eq.nSerie)}</b>)</td>
      <td class="banner-gray">TÉCNICO:</td>
      <td>${safeText(tec.nome)}</td>
    </tr>
    <tr>
      <td class="banner-gray">ENDEREÇO/CIDADE:</td>
      <td colspan="3">${safeText(cli.endereco)}, ${safeText(cli.cidade)} - ${safeText(cli.uf)}</td>
    </tr>
  </table>

  <!-- BLOCO DE FOTOS -->
  ${htmlFotos}

  <!-- TERMO DE CERTIFICAÇÃO TÉCNICA -->
  <div style="page-break-inside: avoid; border: 1px solid #000; padding: 6px; font-size: 7.2pt; text-align: justify; margin-top: 8px; background: #fafafa;">
    <b>CERTIFICAÇÃO TÉCNICA DE AUTENTICIDADE:</b> Atesto sob minha responsabilidade técnica que os registros fotográficos acima foram capturados <i>in loco</i> durante o procedimento de instalação e calibração do equipamento supracitado. As coordenadas geográficas (GPS) e a data/hora foram coletadas pelo dispositivo de campo e gravadas de modo indelével no rodapé de cada imagem, certificando a conformidade dos itens inspecionados.
  </div>

  <div class="footer-confidential">
    Vatech Brasil & Exacta • Anexo Fotográfico de Autenticidade em Campo • OS nº ${safeText(dados.idAtendimento)} • S/N: ${safeText(eq.nSerie)}
  </div>

</body>
</html>`;
}

/**
 * ============================================================================
 * 6. DOSSIÊ COMPLETO CONSOLIDADO (PDF ÚNICO COM TODOS OS DOCUMENTOS E FOTOS)
 * ============================================================================
 */
function gerarHtmlDossieCompleto(dados, chk, rel, gar, fb, sigs, fotos) {
  function extrairCorpo(html) {
    const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return m ? m[1] : html;
  }

  const hChk = extrairCorpo(gerarHtmlChecklist(dados, chk, sigs));
  const hRel = extrairCorpo(gerarHtmlRelatorio(dados, rel, sigs));
  const hGar = extrairCorpo(gerarHtmlGarantia(dados, gar, sigs));
  const hFb = extrairCorpo(gerarHtmlFeedback(dados, fb, sigs));

  let hFotos = '';
  if (fotos && Object.keys(fotos).length > 0) {
    const fotosValidas = Object.values(fotos).filter(f => f && f.dataUrl);
    if (fotosValidas.length > 0) {
      hFotos = `
  <div class="page-break-always" style="page-break-after: always; break-after: page;"></div>
  ${extrairCorpo(gerarHtmlAnexoFotos(dados, fotos, sigs))}`;
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Vatech Exacta - Atendimento Técnico</title>
<style>${PDF_GLOBAL_STYLE}</style>
</head>
<body>
  ${hChk}
  <div class="page-break-always" style="page-break-after: always; break-after: page;"></div>
  ${hRel}
  <div class="page-break-always" style="page-break-after: always; break-after: page;"></div>
  ${hGar}
  <div class="page-break-always" style="page-break-after: always; break-after: page;"></div>
  ${hFb}${hFotos}
</body>
</html>`;
}
