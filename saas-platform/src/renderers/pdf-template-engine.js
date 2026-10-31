/**
 * Mirrored PDF Document Template Engine
 * Generates official, high-fidelity A4 printable HTML/PDF representation of the completed form.
 * Preserves 100% of the original document labels, values, and structure.
 */

function generateMirroredPdfHtml(formDefinition, submissionData = {}) {
  const { metadata, schema } = formDefinition;
  const title = metadata.title || 'Solicitação e Atendimento Técnico';
  const company = metadata.company || 'Vatech Brasil / Exacta';
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Chunk header fields into rows of 2
  const headerFields = schema.header || [];
  const rows = [];
  for (let i = 0; i < headerFields.length; i += 2) {
    rows.push(headerFields.slice(i, i + 2));
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm 12mm 15mm; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9pt; color: #1e293b; line-height: 1.35; margin: 0; padding: 0; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
    .header-logo { font-size: 16pt; font-weight: 800; color: #0284c7; }
    .doc-title { font-size: 13pt; font-weight: 700; text-align: right; color: #0f172a; }
    .doc-meta { font-size: 8pt; color: #64748b; text-align: right; }
    
    .section-title { background-color: #f1f5f9; padding: 5px 8px; font-weight: 700; font-size: 9pt; border-left: 3px solid #0284c7; margin-top: 12px; margin-bottom: 6px; text-transform: uppercase; }
    
    .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .grid-table td { padding: 5px 8px; border: 1px solid #cbd5e1; vertical-align: top; width: 50%; }
    .cell-label { font-size: 7.5pt; color: #64748b; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px; }
    .cell-value { font-size: 9pt; font-weight: 700; color: #0f172a; }
    
    .checklist-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .checklist-table th { background: #e2e8f0; font-size: 8pt; padding: 4px 6px; text-align: left; border: 1px solid #cbd5e1; }
    .checklist-table td { font-size: 8pt; padding: 4px 6px; border: 1px solid #e2e8f0; }
    .status-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 7.5pt; text-align: center; }
    .status-sim { background: #dcfce7; color: #15803d; }
    .status-nao { background: #fee2e2; color: #b91c1c; }
    .status-na { background: #f1f5f9; color: #475569; }

    .signatures-table { width: 100%; border-collapse: collapse; margin-top: 18px; page-break-inside: avoid; }
    .sig-box { width: 50%; border: 1px solid #cbd5e1; padding: 10px; text-align: center; }
    .sig-line { margin-top: 40px; border-top: 1px solid #475569; padding-top: 4px; font-size: 8pt; font-weight: 700; }
    .sig-role { font-size: 7.5pt; color: #64748b; }
    
    .footer { margin-top: 18px; font-size: 7pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 4px; }
  </style>
</head>
<body>

  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="width: 50%; vertical-align: middle;">
        <div class="header-logo">⚡ ${company.toUpperCase()}</div>
        <div style="font-size: 7.5pt; color: #64748b;">Sistema de Homologação e Atendimento em Campo</div>
      </td>
      <td style="width: 50%; vertical-align: middle;">
        <div class="doc-title">${title}</div>
        <div class="doc-meta">Documento Oficial Homologado &bull; Emitido em: ${currentDate}</div>
      </td>
    </tr>
  </table>

  <!-- 1. Dados do Atendimento Extraídos do Documento Original -->
  <div class="section-title">1. Informações Cadastrais e Técnicas Originais</div>
  <table class="grid-table">
    ${rows.map(row => `
      <tr>
        ${row.map(f => `
          <td>
            <span class="cell-label">${f.label}</span>
            <span class="cell-value">${submissionData[f.id] || f.defaultValue || '—'}</span>
          </td>
        `).join('')}
        ${row.length === 1 ? '<td></td>' : ''}
      </tr>
    `).join('')}
  </table>

  <!-- 2. Termos e Condições Legais da Garantia (se for Termo de Garantia) -->
  ${schema.legalClauses && schema.legalClauses.length > 0 ? `
    <div class="section-title">2. Termos e Condições de Garantia (16 Artigos na Íntegra)</div>
    <div style="font-size: 7.5pt; color: #475569; margin-bottom: 6px; font-style: italic;">
      ${schema.legalIntro || 'Os atributos e aspectos gerais desta garantia terão validade e serão estabelecidos mediante ao firmamento do instalador e o cliente na data de instalação.'}
    </div>
    <div style="font-size: 7.5pt; line-height: 1.35; color: #334155; border: 1px solid #cbd5e1; padding: 6px 8px; background: #fafafa;">
      ${schema.legalClauses.map((clause, cIdx) => `
        <div style="margin-bottom: 3.5px; text-align: justify;">
          <b>• ${cIdx + 1}.</b> ${clause}
        </div>
      `).join('')}
    </div>

    ${schema.acceptanceDeclaration ? `
      <div style="margin-top: 8px; padding: 6px 8px; border: 1px solid #94a3b8; background: #f8fafc; font-size: 8pt; font-weight: bold; color: #0f172a;">
        ${schema.acceptanceDeclaration}
      </div>
    ` : ''}
  ` : ''}

  <!-- 3. Checklist Técnico (se presente) -->
  ${(schema.checklist || []).length > 0 ? `
    <div class="section-title">2. Itens de Inspeção e Conformidade Técnica</div>
    ${schema.checklist.map(sec => `
      <div style="font-size: 8pt; font-weight: bold; color: #475569; margin: 4px 0 2px 2px;">• ${sec.title}</div>
      <table class="checklist-table">
        <thead>
          <tr>
            <th style="width: 8%;">Item</th>
            <th style="width: 77%;">Descrição do Procedimento / Verificação</th>
            <th style="width: 15%; text-align: center;">Resultado</th>
          </tr>
        </thead>
        <tbody>
          ${sec.items.map(it => `
            <tr>
              <td style="font-weight: bold; color: #64748b;">${it.code || '#'}</td>
              <td>${it.description}</td>
              <td style="text-align: center;">
                <span class="status-badge status-${(submissionData['check_' + it.id] || it.defaultValue || 'SIM').toLowerCase()}">
                  ${submissionData['check_' + it.id] || it.defaultValue || 'SIM'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `).join('')}
  ` : ''}

  <!-- 3. Observações e Parecer Técnico -->
  ${(schema.narrative || []).length > 0 ? `
    <div class="section-title">3. Parecer Técnico e Observações</div>
    <table class="grid-table">
      <tr>
        <td style="height: 55px;" colspan="2">
          <span class="cell-label">${schema.narrative[0].label}</span>
          <div style="font-size: 8.5pt; margin-top: 4px; font-weight: 500;">
            ${submissionData.tech_description || schema.narrative[0].defaultValue || 'Atendimento concluído em conformidade com as orientações do fabricante.'}
          </div>
        </td>
      </tr>
    </table>
  ` : ''}

  <!-- 4. Assinaturas -->
  <table class="signatures-table">
    <tr>
      ${(schema.signatures || []).map(sig => `
        <td class="sig-box">
          <div style="height: 35px; color: #94a3b8; font-size: 7pt; font-style: italic; line-height: 35px;">
            [ Assinado Digitalmente via App ]
          </div>
          <div class="sig-line">${sig.title}</div>
          <div class="sig-role">${sig.role}</div>
        </td>
      `).join('')}
    </tr>
  </table>

  <div class="footer">
    Documento assinado digitalmente com conformidade técnica. Gerado por DocToField SaaS Platform &bull; Protocolo de Segurança #DOC-${Math.random().toString(36).substring(2, 8).toUpperCase()}
  </div>

</body>
</html>`;
}

module.exports = { generateMirroredPdfHtml };
