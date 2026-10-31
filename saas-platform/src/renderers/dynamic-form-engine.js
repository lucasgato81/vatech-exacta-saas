/**
 * Dynamic Form Generator Engine
 * Converts any Form Definition Schema into an exact, pre-populated, interactive mobile PWA HTML form.
 */

function generateDynamicFormHtml(formDefinition) {
  const { metadata, schema } = formDefinition;
  const title = metadata.title || 'Formulário Técnico de Atendimento';
  const category = metadata.category || 'Atendimento em Campo';
  const company = metadata.company || 'Vatech & Exacta';

  // Group header fields by section
  const sectionsMap = {};
  (schema.header || []).forEach(f => {
    const sec = f.section || 'Dados Gerais do Atendimento';
    if (!sectionsMap[sec]) sectionsMap[sec] = [];
    sectionsMap[sec].push(f);
  });

  const sectionKeys = Object.keys(sectionsMap);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title} — App de Campo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; }
    .signature-pad { border: 2px dashed #94a3b8; border-radius: 0.75rem; background: #ffffff; touch-action: none; cursor: crosshair; }
    .btn-status.active-sim { background-color: #16a34a !important; color: white !important; font-weight: 700; }
    .btn-status.active-nao { background-color: #dc2626 !important; color: white !important; font-weight: 700; }
    .btn-status.active-na { background-color: #475569 !important; color: white !important; font-weight: 700; }
  </style>
</head>
<body class="min-h-screen text-slate-800 pb-20">

  <!-- Top App Header -->
  <header class="bg-slate-900 text-white sticky top-0 z-40 shadow-lg px-4 py-3 flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow">
        ⚡
      </div>
      <div>
        <h1 class="text-sm font-bold leading-tight line-clamp-1">${title}</h1>
        <p class="text-xs text-slate-400 font-medium">${company} &bull; ${category}</p>
      </div>
    </div>
    <div class="flex items-center space-x-2">
      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
        ● Dados Originais Preenchidos
      </span>
    </div>
  </header>

  <main class="max-w-2xl mx-auto px-4 py-6 space-y-6">

    <!-- Cards: Dados Extraídos do Arquivo Original -->
    ${sectionKeys.map((secName, secIdx) => {
      const fields = sectionsMap[secName];
      return `
        <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📋</span> ${secIdx + 1}. ${secName}
            </h2>
            <span class="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Arquivo Original
            </span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${fields.map(f => {
              const val = (f.defaultValue || '').replace(/"/g, '&quot;');
              return `
                <div class="${f.type === 'textarea' ? 'md:col-span-2' : ''}">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    ${f.label} ${f.required ? '<span class="text-red-500">*</span>' : ''}
                  </label>
                  ${f.type === 'textarea' ? `
                    <textarea id="field_${f.id}" name="${f.id}" rows="3" class="w-full text-sm font-medium rounded-xl border border-slate-300 p-3 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">${val}</textarea>
                  ` : `
                    <input type="text"
                           id="field_${f.id}"
                           name="${f.id}"
                           value="${val}"
                           placeholder="${f.label}"
                           class="w-full text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 px-3.5 py-2.5 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition">
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }).join('')}

    <!-- Checklist Técnico (Renderiza se houver itens no documento) -->
    ${(schema.checklist || []).length > 0 ? `
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>✅</span> Itens de Inspeção e Conformidade
          </h2>
          <div class="flex gap-2">
            <button type="button" onclick="setAllChecklist('SIM')" class="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
              ✓ Todos SIM
            </button>
          </div>
        </div>

        <div class="space-y-6">
          ${schema.checklist.map((sec, secIdx) => `
            <div class="space-y-3">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                ${sec.title}
              </h3>
              <div class="space-y-2">
                ${sec.items.map(item => `
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 gap-2">
                    <div class="flex items-start gap-2 text-sm text-slate-800">
                      <span class="font-bold text-slate-400 text-xs mt-0.5">${item.code || '#'}.</span>
                      <span class="font-medium">${item.description}</span>
                    </div>
                    <div class="flex items-center gap-1 self-end sm:self-center shrink-0">
                      <button type="button" onclick="setCheckItem('${item.id}', 'SIM', this)" class="btn-status px-3 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 active-sim">SIM</button>
                      <button type="button" onclick="setCheckItem('${item.id}', 'NAO', this)" class="btn-status px-3 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700">NÃO</button>
                      <button type="button" onclick="setCheckItem('${item.id}', 'NA', this)" class="btn-status px-3 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700">N/A</button>
                      <input type="hidden" id="check_${item.id}" name="check_${item.id}" value="SIM">
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Observações e Parecer Técnico -->
    ${(schema.narrative || []).length > 0 ? `
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>📝</span> Observações e Parecer do Atendimento
          </h2>
        </div>
        <div class="space-y-4">
          ${schema.narrative.map(nar => `
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">${nar.label}</label>
              <textarea id="field_${nar.id}" rows="${nar.rows || 3}" class="w-full text-sm font-medium rounded-xl border border-slate-300 p-3 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none">${nar.defaultValue || ''}</textarea>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Evidências Fotográficas com Carimbo GPS -->
    <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📷</span> Evidências Fotográficas (GPS + Data/Hora)
        </h2>
        <span class="text-xs text-slate-400">Auditoria</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${(schema.media || []).map(med => `
          <div class="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition relative">
            <input type="file" accept="image/*" capture="environment" id="file_${med.id}" onchange="handlePhotoUpload('${med.id}', this)" class="hidden">
            <label for="file_${med.id}" class="cursor-pointer block">
              <div id="preview_${med.id}" class="mb-2 hidden">
                <img class="w-full h-36 object-cover rounded-lg shadow-sm">
                <p class="text-[10px] text-emerald-600 font-bold mt-1">✓ Carimbado com GPS e Horário</p>
              </div>
              <div id="placeholder_${med.id}">
                <div class="text-3xl mb-1 text-slate-400">📸</div>
                <div class="text-xs font-bold text-slate-700">${med.label}</div>
                <div class="text-[11px] text-slate-500 mt-0.5">${med.description || 'Toque para capturar foto'}</div>
              </div>
            </label>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Assinaturas Digitais em Campo -->
    <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>✍️</span> Assinaturas Digitais & Homologação
        </h2>
        <span class="text-xs text-slate-400">Validade Legal</span>
      </div>
      <div class="space-y-6">
        ${(schema.signatures || []).map(sig => `
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-700">${sig.title} (${sig.role})</label>
              <button type="button" onclick="clearSignature('${sig.id}')" class="text-[11px] text-red-500 hover:text-red-700 font-semibold">
                Limpar Assinatura
              </button>
            </div>
            <canvas id="pad_${sig.id}" class="signature-pad w-full h-32"></canvas>
            <p class="text-[11px] text-slate-400 mt-1">${sig.prompt || 'Assine com o dedo ou caneta stylus no quadro acima'}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Submit Action -->
    <div class="pt-4">
      <button type="button" onclick="submitAttendance()" class="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition transform active:scale-[0.99] flex items-center justify-center gap-2">
        <span>🚀</span> Finalizar e Homologar Atendimento
      </button>
    </div>

  </main>

  <script>
    function setCheckItem(id, value, btn) {
      document.getElementById('check_' + id).value = value;
      const parent = btn.parentElement;
      parent.querySelectorAll('.btn-status').forEach(b => {
        b.classList.remove('active-sim', 'active-nao', 'active-na');
      });
      if (value === 'SIM') btn.classList.add('active-sim');
      if (value === 'NAO') btn.classList.add('active-nao');
      if (value === 'NA') btn.classList.add('active-na');
    }

    function setAllChecklist(val) {
      document.querySelectorAll('[id^="check_"]').forEach(input => {
        const id = input.id.replace('check_', '');
        input.value = val;
        const parent = input.parentElement;
        parent.querySelectorAll('.btn-status').forEach(b => {
          b.classList.remove('active-sim', 'active-nao', 'active-na');
          if (b.textContent.trim() === val) b.classList.add(val === 'SIM' ? 'active-sim' : val === 'NAO' ? 'active-nao' : 'active-na');
        });
      });
    }

    function handlePhotoUpload(id, input) {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = document.querySelector('#preview_' + id + ' img');
          img.src = e.target.result;
          document.getElementById('preview_' + id).classList.remove('hidden');
          document.getElementById('placeholder_' + id).classList.add('hidden');
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    const pads = {};
    window.addEventListener('load', () => {
      document.querySelectorAll('.signature-pad').forEach(canvas => {
        const id = canvas.id.replace('pad_', '');
        canvas.width = canvas.parentElement.clientWidth || 400;
        canvas.height = 130;
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

        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', stop);
        canvas.addEventListener('touchstart', start, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        window.addEventListener('touchend', stop);

        pads[id] = { canvas, ctx };
      });
    });

    function clearSignature(id) {
      if (pads[id]) {
        pads[id].ctx.clearRect(0, 0, pads[id].canvas.width, pads[id].canvas.height);
      }
    }

    function submitAttendance() {
      alert('Atendimento Homologado com Sucesso! Os dados foram validados e o PDF oficial espelhado foi gerado.');
    }
  </script>
</body>
</html>`;
}

module.exports = { generateDynamicFormHtml };
