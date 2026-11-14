/* Keep authenticated boot unchanged; guest mode never loads the cloud client. */
if (window.CH_GUEST && window.CH_GUEST.enabled) {
  window.CH_GUEST.start();
} else {
  const source = document.currentScript.dataset.saas || 'saas.js';
  document.write('<script src="' + source.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"><\/script>');
}
