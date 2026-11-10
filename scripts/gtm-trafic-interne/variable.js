function() {
  try {
    var q = window.location.search || '';
    if (/[?&]interne=0(&|$)/.test(q)) { return undefined; }
    if (/[?&](interne=1|envoi=test)(&|$)/.test(q) || /[?&]utm_source=test-/.test(q)) { return 'internal'; }
    if (/(^|; )mdp_interne=1(;|$)/.test(document.cookie || '')) { return 'internal'; }
  } catch (e) {}
  return undefined;
}
