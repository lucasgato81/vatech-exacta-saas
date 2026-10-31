async function checkTunnelWorkflow() {
  try {
    const url = 'https://eight-reprints-labour-filtering.trycloudflare.com/workflow/os_260930092200';
    const res = await fetch(url);
    console.log('Tunnel Workflow Status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Tunnel Workflow HTML length:', text.length);
    console.log('Has 61 items:', text.includes('q61'));
    console.log('Has 16 clauses:', text.includes('• A garantia no equipamento será prestada'));
    console.log('Has Ez3D-i:', text.includes('fb_q3b_3dpan'));
    console.log('Has PDF Dossie generator:', text.includes('gerarHtmlDossieCompleto'));
  } catch (err) {
    console.error('Tunnel workflow check error:', err);
  }
}

checkTunnelWorkflow();
