async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/load-full-sequence');
    const data = await res.json();
    console.log('Sequence API success:', data.success);
    console.log('Batch ID:', data.batchId);
    console.log('Workflow URL:', data.workflowUrl);
    console.log('Extracted OS:', data.attendanceData.idAtendimento);
    console.log('Extracted Client:', data.attendanceData.cliente.razaoSocial);
    console.log('Extracted Equipment:', data.attendanceData.equipamento.modelo, data.attendanceData.equipamento.nSerie);

    const wfRes = await fetch('http://localhost:3000' + data.workflowUrl);
    const html = await wfRes.text();
    console.log('Workflow HTML Length:', html.length);
    console.log('Pre-filled Client in HTML:', html.includes(data.attendanceData.cliente.razaoSocial));
    console.log('Pre-filled Serial in HTML:', html.includes(data.attendanceData.equipamento.nSerie));
    console.log('Contains 61 Items (q61):', html.includes('q61'));
    console.log('Contains 16 clauses in Step 4:', html.includes('• A garantia no equipamento será prestada'));
    console.log('Contains Ez3D-i in Step 5:', html.includes('fb_q3b_3dpan'));
    console.log('Contains PDF Dossie generator:', html.includes('gerarHtmlDossieCompleto'));
  } catch (err) {
    console.error('Test error:', err);
  }
}

run();
