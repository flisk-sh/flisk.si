/* The filter: every link is in the HTML, so the page reads without this script. */
(function () {
  const input = document.getElementById('filter');
  const empty = document.getElementById('empty');
  const groups = Array.from(document.querySelectorAll('[data-group]'));
  if (!input) return;

  function apply() {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    groups.forEach((group) => {
      let inGroup = 0;
      group.querySelectorAll('[data-row]').forEach((row) => {
        const match = words.every((word) => row.dataset.text.includes(word));
        row.hidden = !match;
        if (match) inGroup += 1;
      });
      group.hidden = inGroup === 0;
      shown += inGroup;
    });
    empty.hidden = shown > 0;
  }

  input.addEventListener('input', apply);
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== input) {
      event.preventDefault();
      input.focus();
    } else if (event.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      apply();
    }
  });
  apply();
})();
