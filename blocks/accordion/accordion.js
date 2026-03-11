/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

function createAccordionItem(row, doc) {
  // decorate accordion item label
  const label = row.children[0];
  const summary = doc.createElement('summary');
  summary.className = 'accordion-item-label';
  summary.append(...label.childNodes);

  // decorate accordion item body
  const body = row.children[1];
  body.className = 'accordion-item-body';

  // decorate accordion item
  const details = doc.createElement('details');
  details.className = 'accordion-item';
  details.append(summary, body);

  return details;
}

function bindSingleOpen(items) {
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;

      items.forEach((sibling) => {
        if (sibling !== item) {
          sibling.open = false;
        }
      });
    });
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  const doc = block.ownerDocument || document;
  const items = rows.map((row) => createAccordionItem(row, doc));

  rows.forEach((row, index) => {
    row.replaceWith(items[index]);
  });

  if (block.classList.contains('single-open')) {
    bindSingleOpen(items);
  }
}
