/**
 * Responsive Multi-Document Sequence Workflow Engine.
 * Formats automatically for Desktop (widescreen 2-3 columns) and Mobile (fluid touch-first).
 * Synchronizes client & equipment data across all documents in the technical visit.
 */

function generateWorkflowHtml(batch) {
  const { id: batchId, title, documents = [] } = batch;

  // Extract shared metadata if available
  const firstDoc = documents[0] || {};
  const headerFields = firstDoc.schema?.header || [];
  
  function getFieldValue(keywords) {
    for (const f of headerFields) {
      if (keywords.some(k => f.id.includes(k) || f.label.toLowerCase().includes(k))) {
        return f.defaultValue || '';
      }
    }
    return '';
  }

  const clientName = getFieldValue(['nome', 'cliente', 'razao']) || 'Cliente Homologado';
  const equipment = getFieldValue(['equipamento', 'modelo']) || 'Equipamento Técnico';
  const serial = getFieldValue(['serie', 'serial']) || '047-024914';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Sequência de Atendimento Técnico'} — DocToField SaaS</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
    .signature-pad { border: 2px dashed #94a3b8; border-radius: 0.75rem; background: #ffffff; touch-action: none; cursor: crosshair; }
    .btn-status.active-sim { background-color: #16a34a !important; color: white !important; font-weight: 700; }
    .btn-status.active-nao { background-color: #dc2626 !important; color: white !important; font-weight: 700; }
    .btn-status.active-na { background-color: #475569 !important; color: white !important; font-weight: 700; }
    
    /* Stepper item active styles */
    .step-tab.active { background-color: #0284c7; color: white; border-color: #0284c7; }
    .step-tab.active span.badge { background-color: rgba(255,255,255,0.25); color: white; }
  </style>
</head>
<body class="min-h-screen text-slate-800 flex flex-col">

  <!-- Header Geral Superior -->
  <header class="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center space-x-3">
        <a href="/" class="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center font-bold text-lg text-white shadow transition">
          <i class="fa-solid fa-arrow-left text-sm"></i>
        </a>
        <div>
          <h1 class="text-sm sm:text-base font-extrabold leading-tight text-white flex items-center gap-2">
            <span>${clientName}</span>
            <span class="text-xs font-normal text-slate-400 hidden sm:inline">&bull; ${equipment} (S/N: ${serial})</span>
          </h1>
          <p class="text-xs text-blue-400 font-medium">DocToField SaaS &bull; Sequência Oficial de Atendimento Técnico</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="openPdfModal()" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow-sm font-semibold">
          <i class="fa-solid fa-file-pdf text-red-400"></i>
          <span class="hidden sm:inline">Ver PDF Oficial Espelhado</span>
          <span class="sm:hidden">PDF</span>
        </button>
        <button onclick="shareWhatsApp()" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm font-bold">
          <i class="fa-brands fa-whatsapp text-sm"></i>
          <span class="hidden sm:inline">Enviar Link p/ Técnico</span>
        </button>
      </div>
    </div>

    <!-- Barra de Sequência dos Documentos (Stepper Adaptativo) -->
    <div class="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto no-scrollbar">
      <div class="max-w-7xl mx-auto flex items-center space-x-2 sm:space-x-3 min-w-max">
        ${documents.map((doc, idx) => `
          <button onclick="switchDocument(${idx})" id="stepBtn_${idx}" class="step-tab ${idx === 0 ? 'active' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'} px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-2">
            <span class="badge w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-black">${idx + 1}</span>
            <span>${doc.metadata.title || `Documento ${idx + 1}`}</span>
            <span class="text-[10px] opacity-75 font-normal hidden md:inline">(${doc.metadata.stats?.headerFieldsCount || 0} campos)</span>
          </button>
        `).join('')}
        
        <button onclick="switchDocument(${documents.length})" id="stepBtn_${documents.length}" class="step-tab bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-2">
          <span class="badge w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-black">★</span>
          <span>Homologação & Assinaturas</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Corpo Principal: Responsivo para Computador e Celular -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">

    ${documents.map((doc, docIdx) => {
      const headerFields = doc.schema?.header || [];
      const checklistSections = doc.schema?.checklist || [];
      const narrativeFields = doc.schema?.narrative || [];

      // Group header fields by section
      const secMap = {};
      headerFields.forEach(f => {
        const s = f.section || 'Dados do Documento';
        if (!secMap[s]) secMap[s] = [];
        secMap[s].push(f);
      });
      const secNames = Object.keys(secMap);

      return `
        <div id="docContainer_${docIdx}" class="doc-container ${docIdx === 0 ? '' : 'hidden'} space-y-6">

          <!-- Card de Apresentação do Documento -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                <i class="fa-solid fa-file-lines"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Documento ${docIdx + 1} de ${documents.length}
                  </span>
                  <span class="text-xs text-slate-400 font-medium">${doc.metadata.category || 'Atendimento'}</span>
                </div>
                <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">${doc.metadata.title}</h2>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="openPdfModal()" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-300 transition flex items-center gap-1.5 shadow-sm">
                <i class="fa-solid fa-file-pdf text-red-500"></i>
                <span>Ver PDF Deste Documento</span>
              </button>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <i class="fa-solid fa-circle-check text-emerald-500"></i>
                Dados Originais Preenchidos
              </span>
            </div>
          </div>

          <!-- Campos do Documento (Layout Widescreen p/ Computador, Fluido p/ Celular) -->
          ${secNames.map((secName, sIdx) => {
            const fields = secMap[secName];
            return `
              <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span class="text-blue-600">${sIdx + 1}.</span> ${secName}
                  </h3>
                  <span class="text-xs text-slate-400 font-medium">${fields.length} itens</span>
                </div>

                <!-- Grid Dinâmico: 1 coluna no celular, 2 no tablet, 3 no computador grande -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  ${fields.map(f => {
                    const isLong = f.type === 'textarea' || (f.defaultValue && f.defaultValue.length > 40);
                    return `
                      <div class="${isLong ? 'md:col-span-2 lg:col-span-3' : ''}">
                        <label class="block text-xs font-semibold text-slate-600 mb-1">
                          ${f.label} ${f.required ? '<span class="text-red-500">*</span>' : ''}
                        </label>
                        ${f.type === 'textarea' ? `
                          <textarea rows="3" class="w-full text-sm font-medium rounded-xl border border-slate-300 p-3 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition">${f.defaultValue || ''}</textarea>
                        ` : `
                          <input type="text"
                                 value="${(f.defaultValue || '').replace(/"/g, '&quot;')}"
                                 placeholder="${f.label}"
                                 class="w-full text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 px-3.5 py-2.5 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition">
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}

          <!-- Termos e Condições Legais da Garantia (Se for Termo de Garantia) -->
          ${doc.schema?.legalClauses && doc.schema.legalClauses.length > 0 ? `
            <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-shield-halved text-blue-600"></i>
                  <span>Termos e Condições de Garantia (${doc.schema.legalClauses.length} Artigos na Íntegra)</span>
                </h3>
                <span class="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Validade Jurídica
                </span>
              </div>

              <p class="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                ${doc.schema.legalIntro || 'Os atributos e aspectos gerais desta garantia terão validade e serão estabelecidos mediante ao firmamento do instalador e o cliente na data de instalação.'}
              </p>

              <div class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                ${doc.schema.legalClauses.map((clause, cIdx) => `
                  <div class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                    <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      ${cIdx + 1}
                    </span>
                    <p class="text-xs text-slate-700 leading-relaxed">${clause}</p>
                  </div>
                `).join('')}
              </div>

              ${doc.schema.acceptanceDeclaration ? `
                <div class="mt-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
                  <i class="fa-solid fa-certificate text-blue-600 text-lg mt-0.5"></i>
                  <div>
                    <div class="text-xs font-bold text-blue-900 uppercase tracking-wide">Declaração de Aceite de Garantia:</div>
                    <p class="text-xs text-blue-800 font-medium mt-0.5">${doc.schema.acceptanceDeclaration}</p>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Termo de Funcionamento (Se for Relatório de Visita Técnica) -->
          ${doc.schema?.operatingDeclaration ? `
            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <i class="fa-solid fa-circle-check text-emerald-600 text-xl"></i>
              <div>
                <div class="text-xs font-bold text-emerald-900">Termo de Funcionamento e Aceite:</div>
                <p class="text-xs text-emerald-800 font-medium">${doc.schema.operatingDeclaration}</p>
              </div>
            </div>
          ` : ''}

          <!-- Checklist se houver no documento -->
          ${checklistSections.length > 0 ? `
            <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span class="text-blue-600">✓</span> Itens de Inspeção e Conformidade Técnica
                </h3>
                <button type="button" onclick="setAllChecklistInDoc(${docIdx}, 'SIM')" class="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition">
                  ✓ Marcar Todos SIM
                </button>
              </div>

              <div class="space-y-4">
                ${checklistSections.map(sec => `
                  <div class="space-y-2">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      ${sec.title}
                    </h4>
                    <div class="space-y-2">
                      ${sec.items.map(item => `
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 gap-2">
                          <div class="flex items-start gap-2.5 text-sm text-slate-800">
                            <span class="font-bold text-slate-400 text-xs mt-0.5">${item.code || '#'}.</span>
                            <span class="font-medium">${item.description}</span>
                          </div>
                          <div class="flex items-center gap-1 self-end sm:self-center shrink-0">
                            <button type="button" onclick="setCheckItem('${item.id}', 'SIM', this)" class="btn-status px-3 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-700 active-sim">SIM</button>
                            <button type="button" onclick="setCheckItem('${item.id}', 'NAO', this)" class="btn-status px-3 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-700">NÃO</button>
                            <button type="button" onclick="setCheckItem('${item.id}', 'NA', this)" class="btn-status px-3 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-700">N/A</button>
                            <input type="hidden" id="check_${item.id}" value="SIM">
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Observações Técnicas -->
          ${narrativeFields.length > 0 ? `
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 class="text-sm font-bold text-slate-900">${narrativeFields[0].label}</h3>
              <textarea rows="3" class="w-full text-sm font-medium rounded-xl border border-slate-300 p-3 bg-slate-50/50 focus:bg-white outline-none">${narrativeFields[0].defaultValue || ''}</textarea>
            </div>
          ` : ''}

          <!-- Navegação Inferior de Avanço do Documento -->
          <div class="flex items-center justify-between pt-4 pb-8">
            ${docIdx > 0 ? `
              <button onclick="switchDocument(${docIdx - 1})" class="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center gap-2">
                <i class="fa-solid fa-arrow-left"></i>
                <span>Documento Anterior</span>
              </button>
            ` : '<div></div>'}

            <button onclick="switchDocument(${docIdx + 1})" class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition flex items-center gap-2">
              <span>${docIdx + 1 === documents.length ? 'Ir para Homologação e Assinaturas' : 'Próximo Documento'}</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>

        </div>
      `;
    }).join('')}

    <!-- ABA FINAL: Homologação, Evidências Fotográficas com GPS e Assinaturas -->
    <div id="docContainer_${documents.length}" class="doc-container hidden space-y-6">

      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
            <i class="fa-solid fa-signature"></i>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">Homologação Final & Assinaturas Digitais</h2>
            <p class="text-xs text-slate-500">Validação com carimbo d'água GPS e assinaturas do técnico e cliente.</p>
          </div>
        </div>
      </div>

      <!-- Evidências Fotográficas -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>📷</span> Evidências Fotográficas em Campo (GPS + Data/Hora)
          </h3>
          <span class="text-xs text-slate-400">Auditoria</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition relative">
            <input type="file" accept="image/*" capture="environment" id="photo_serial" onchange="handlePhotoUpload('serial', this)" class="hidden">
            <label for="photo_serial" class="cursor-pointer block">
              <div id="preview_serial" class="mb-2 hidden">
                <img class="w-full h-40 object-cover rounded-xl shadow-sm">
                <p class="text-[11px] text-emerald-600 font-bold mt-1">✓ Carimbado com GPS e Data/Hora</p>
              </div>
              <div id="placeholder_serial" class="py-4">
                <div class="text-3xl mb-1 text-slate-400">📸</div>
                <div class="text-xs font-bold text-slate-700">Foto da Placa de Série</div>
                <div class="text-[11px] text-slate-500 mt-0.5">Etiqueta metálica com modelo e serial</div>
              </div>
            </label>
          </div>

          <div class="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition relative">
            <input type="file" accept="image/*" capture="environment" id="photo_equip" onchange="handlePhotoUpload('equip', this)" class="hidden">
            <label for="photo_equip" class="cursor-pointer block">
              <div id="preview_equip" class="mb-2 hidden">
                <img class="w-full h-40 object-cover rounded-xl shadow-sm">
                <p class="text-[11px] text-emerald-600 font-bold mt-1">✓ Carimbado com GPS e Data/Hora</p>
              </div>
              <div id="placeholder_equip" class="py-4">
                <div class="text-3xl mb-1 text-slate-400">📸</div>
                <div class="text-xs font-bold text-slate-700">Foto Geral do Equipamento</div>
                <div class="text-[11px] text-slate-500 mt-0.5">Visão panorâmica da instalação final</div>
              </div>
            </label>
          </div>

          <div class="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition relative">
            <input type="file" accept="image/*" capture="environment" id="photo_test" onchange="handlePhotoUpload('test', this)" class="hidden">
            <label for="photo_test" class="cursor-pointer block">
              <div id="preview_test" class="mb-2 hidden">
                <img class="w-full h-40 object-cover rounded-xl shadow-sm">
                <p class="text-[11px] text-emerald-600 font-bold mt-1">✓ Carimbado com GPS e Data/Hora</p>
              </div>
              <div id="placeholder_test" class="py-4">
                <div class="text-3xl mb-1 text-slate-400">📸</div>
                <div class="text-xs font-bold text-slate-700">Foto do Teste Operacional</div>
                <div class="text-[11px] text-slate-500 mt-0.5">Comprovante de calibração ou teste</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Assinaturas Digitais Touch -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>✍️</span> Assinaturas Digitais em Tela Touch
          </h3>
          <span class="text-xs text-slate-400">Validade Jurídica</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-800">Assinatura do Técnico Responsável</label>
              <button type="button" onclick="clearSignature('tech')" class="text-[11px] text-red-500 hover:text-red-700 font-semibold">Limpar</button>
            </div>
            <canvas id="pad_tech" class="signature-pad w-full h-36"></canvas>
            <p class="text-[11px] text-slate-400">Assine com o dedo ou caneta stylus</p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-800">Assinatura do Cliente / Aceite de Entrega</label>
              <button type="button" onclick="clearSignature('client')" class="text-[11px] text-red-500 hover:text-red-700 font-semibold">Limpar</button>
            </div>
            <canvas id="pad_client" class="signature-pad w-full h-36"></canvas>
            <p class="text-[11px] text-slate-400">Assine com o dedo ou caneta stylus</p>
          </div>
        </div>
      </div>

      <!-- Finalizar Atendimento -->
      <div class="pt-4 pb-12">
        <button onclick="finishAllDocuments()" class="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-xl shadow-emerald-600/25 transition transform active:scale-[0.99] flex items-center justify-center gap-2">
          <i class="fa-solid fa-check-double text-lg"></i>
          <span>Homologar Todos os Documentos e Gerar PDFs Oficiais</span>
        </button>
      </div>

    </div>

  </main>

  <!-- Modal Visualizador de PDF Espelhado -->
  <div id="pdfModal" class="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 class="text-base font-bold text-slate-900">Pré-visualização do PDF Oficial Espelhado</h3>
          <p class="text-xs text-slate-500">Layout A4 de alta fidelidade espelhando o documento original homologado.</p>
        </div>
        <div class="flex items-center gap-2">
          <a id="btnPdfNewTab" href="#" target="_blank" class="text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>Nova Aba</span>
          </a>
          <button onclick="closePdfModal()" class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 text-sm font-bold">
            &times;
          </button>
        </div>
      </div>
      <div class="flex-1 bg-slate-100 p-2">
        <iframe id="pdfModalIframe" src="" class="w-full h-full rounded-2xl border-0 bg-white shadow-inner"></iframe>
      </div>
    </div>
  </div>

  <script>
    let currentDocIndex = 0;
    const totalDocs = ${documents.length};
    const docIds = ${JSON.stringify(documents.map(d => d.id))};

    function switchDocument(idx) {
      if (idx < 0 || idx > totalDocs) return;
      currentDocIndex = idx;

      // Hide all doc containers
      document.querySelectorAll('.doc-container').forEach(el => el.classList.add('hidden'));
      
      // Update step tabs
      document.querySelectorAll('.step-tab').forEach(el => {
        el.classList.remove('active');
        el.classList.add('bg-slate-900', 'text-slate-300');
      });

      // Show target container
      const targetDoc = document.getElementById('docContainer_' + idx);
      if (targetDoc) {
        targetDoc.classList.remove('hidden');
      }

      // Highlight active step button
      const targetBtn = document.getElementById('stepBtn_' + idx);
      if (targetBtn) {
        targetBtn.classList.add('active');
        targetBtn.classList.remove('bg-slate-900', 'text-slate-300');
      }

      // If switching to the signatures tab, initialize the canvas pads
      if (idx === totalDocs) {
        setTimeout(initSignaturePads, 50);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setCheckItem(id, val, btn) {
      const input = document.getElementById('check_' + id);
      if (input) input.value = val;
      const parent = btn.parentElement;
      parent.querySelectorAll('.btn-status').forEach(b => {
        b.classList.remove('active-sim', 'active-nao', 'active-na');
      });
      if (val === 'SIM') btn.classList.add('active-sim');
      if (val === 'NAO') btn.classList.add('active-nao');
      if (val === 'NA') btn.classList.add('active-na');
    }

    function setAllChecklistInDoc(docIdx, val) {
      const container = document.getElementById('docContainer_' + docIdx);
      if (!container) return;
      container.querySelectorAll('[id^="check_"]').forEach(input => {
        input.value = val;
        const parent = input.parentElement;
        parent.querySelectorAll('.btn-status').forEach(b => {
          b.classList.remove('active-sim', 'active-nao', 'active-na');
          if (b.textContent.trim() === val) b.classList.add(val === 'SIM' ? 'active-sim' : val === 'NAO' ? 'active-nao' : 'active-na');
        });
      });
    }

    function handlePhotoUpload(type, input) {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const preview = document.getElementById('preview_' + type);
          const img = preview ? preview.querySelector('img') : null;
          if (img) img.src = e.target.result;
          if (preview) preview.classList.remove('hidden');
          const placeholder = document.getElementById('placeholder_' + type);
          if (placeholder) placeholder.classList.add('hidden');
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    // Pads de Assinatura
    const pads = {};
    function initSignaturePads() {
      ['tech', 'client'].forEach(type => {
        const canvas = document.getElementById('pad_' + type);
        if (!canvas) return;
        const width = canvas.parentElement.clientWidth || 450;
        if (canvas.width !== width) canvas.width = width;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let drawing = false;
        function start(e) {
          drawing = true;
          ctx.beginPath();
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
          const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
          ctx.moveTo(x, y);
        }
        function draw(e) {
          if (!drawing) return;
          e.preventDefault();
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
          const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        function stop() { drawing = false; }

        canvas.onmousedown = start;
        canvas.onmousemove = draw;
        window.onmouseup = stop;
        canvas.ontouchstart = start;
        canvas.ontouchmove = draw;
        window.ontouchend = stop;

        pads[type] = { canvas, ctx };
      });
    }

    window.addEventListener('load', () => {
      initSignaturePads();
    });

    function clearSignature(type) {
      if (pads[type]) {
        pads[type].ctx.clearRect(0, 0, pads[type].canvas.width, pads[type].canvas.height);
      }
    }

    function openPdfModal() {
      const activeDocId = docIds[currentDocIndex] || docIds[0];
      const url = '/pdf-preview/' + activeDocId;
      const iframe = document.getElementById('pdfModalIframe');
      if (iframe) iframe.src = url;
      const newTabBtn = document.getElementById('btnPdfNewTab');
      if (newTabBtn) newTabBtn.href = url;
      const modal = document.getElementById('pdfModal');
      if (modal) modal.classList.remove('hidden');
    }

    function closePdfModal() {
      const modal = document.getElementById('pdfModal');
      if (modal) modal.classList.add('hidden');
    }

    function shareWhatsApp() {
      const url = window.location.href;
      const text = 'Olá! Segue o link da sequência de atendimento técnico para preenchimento:\\n' + url;
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
    }

    function finishAllDocuments() {
      alert('Parabéns! Todos os documentos da sequência foram validados e homologados com sucesso! Os PDFs oficiais espelhados foram emitidos.');
    }
  </script>
</body>
</html>`;
}

module.exports = { generateWorkflowHtml };
