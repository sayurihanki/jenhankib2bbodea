import { readBlockConfig, toClassName } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function getContentRow(block) {
  return [...block.querySelectorAll(':scope > div')].find((row) => {
    const firstCell = row.children?.[0];
    return toClassName(firstCell?.textContent) === 'content';
  });
}

async function resolveFallbackFragment(path) {
  if (!path) {
    return null;
  }

  try {
    return await loadFragment(path);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load experiment fallback fragment', error);
    return null;
  }
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const slotId = config.slotid || config['slot-id'];
  const fallbackFragment = config.fallbackfragment || config['fallback-fragment'];
  const surfaceHint = config.surfacehint || config['surface-hint'] || 'block';
  const contentRow = getContentRow(block);
  const contentCell = contentRow?.children?.[1];
  const slotContent = document.createElement('div');

  block.classList.add('experiment-slot--ready');
  block.dataset.experimentSlot = slotId || '';
  block.dataset.experimentSurface = surfaceHint;

  if (contentCell) {
    slotContent.append(...contentCell.cloneNode(true).childNodes);
  } else {
    const fallback = await resolveFallbackFragment(fallbackFragment);
    if (fallback) {
      slotContent.append(...fallback.childNodes);
    }
  }

  slotContent.className = 'experiment-slot__content';
  block.replaceChildren(slotContent);
}
