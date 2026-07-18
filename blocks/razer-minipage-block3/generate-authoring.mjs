/* eslint-env node */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIRECTORY = dirname(fileURLToPath(import.meta.url));

const SETTINGS = {
  'content-mode': 'merge',
  'show-options': 'true',
  'show-delivery': 'true',
  'show-trust': 'true',
  'show-highlights': 'true',
  'show-features': 'false',
  'show-specifications': 'false',
  'show-related-products': 'true',
  'sticky-purchase': 'true',
  'ui-buy-label': 'Buy now',
  'ui-delivery-heading': 'Delivery',
  'ui-pickup-heading': 'Pickup',
  'ui-specifications-heading': 'Technical specifications',
  'ui-related-heading': 'Complete your setup',
  'token-accent': '#44d62c',
};

const CONTENT = {
  metadata: {
    title: 'Razer Basilisk V3 Pro 35K',
    description: 'Fully Customizable Wireless Ergonomic RGB Gaming Mouse',
    image: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h5a/h1c/9821720576030/basilisk-v3-pro-35k-500x500.png',
  },
  product: {
    sku: 'RZ01-05240100-R3U1',
    color: 'Black',
    title: 'Razer Basilisk V3 Pro 35K',
    subtitle: 'Fully Customizable Wireless Ergonomic RGB Gaming Mouse',
    price: 'US$159.99',
    originalPrice: '',
    discount: '',
    url: 'https://www.razer.com/gaming-mice/razer-basilisk-v3-pro-35k/RZ01-05240100-R3U1',
    pickup: 'Check availability at RazerStore',
  },
  gallery: [
    {
      src: 'https://assets3.razerzone.com/e_Wgt84QExereiAe4BgOEYV8IVs=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh8b%2Fhf1%2F9821719822366%2F241001-basilisk-v3-pro-35k-1500x1000-1.jpg',
      alt: 'Razer Basilisk V3 Pro 35K mouse in black, three-quarter top view',
      width: 1500,
      height: 1000,
    },
    {
      src: 'https://assets3.razerzone.com/laksrfEC1Edzex-9zPaKaKp0QLE=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh23%2Fhee%2F9821719920670%2F241001-basilisk-v3-pro-35k-1500x1000-2.jpg',
      alt: 'Razer Basilisk V3 Pro 35K mouse in black, left-side view',
      width: 1500,
      height: 1000,
    },
    {
      src: 'https://assets3.razerzone.com/QVQVdgOY1H57jIq5IabOP6QQ6zU=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fhdd%2Fhf0%2F9821719887902%2F241001-basilisk-v3-pro-35k-1500x1000-3.jpg',
      alt: 'Razer Basilisk V3 Pro 35K mouse in black, right-side view',
      width: 1500,
      height: 1000,
    },
  ],
  optionGroups: [
    {
      key: 'group-01',
      label: 'Color / Design',
      options: [
        { key: 'option-01', label: 'Black', selected: true },
        { key: 'option-02', label: 'White' },
        { key: 'option-03', label: 'Phantom Green Edition', price: '+US$10.00' },
        { key: 'option-04', label: 'Phantom White Edition', price: '+US$10.00' },
      ],
    },
    {
      key: 'group-02',
      label: 'Model',
      options: [
        { key: 'option-01', label: 'Basilisk V3 Pro 35K', selected: true },
        { key: 'option-02', label: '+ Mouse Dock Pro', price: '+US$40.00' },
        { key: 'option-03', label: '+ Wireless Charging Puck', price: '+US$20.00' },
      ],
    },
    {
      key: 'group-03',
      label: 'Add RazerCare Protection',
      options: [
        { key: 'option-01', label: 'RazerCare Elite For Mice', price: '+US$29.99' },
        { key: 'option-02', label: 'No, Thank You', selected: true },
      ],
    },
  ],
  delivery: [
    { label: 'Express delivery', value: 'US$15.00' },
    { label: 'Standard delivery', value: 'Free' },
  ],
  trust: [
    'Next Business Day Shipping',
    'Risk Free Return',
    'Comprehensive Customer Support',
  ],
  highlights: [
    'Configurable Razer™ HyperScroll Tilt Wheel',
    'Razer™ Focus Pro 35K Optical Sensor Gen-2',
    'Up to 140 Hours on Razer™ HyperSpeed Wireless',
  ],
  relatedProducts: [
    {
      image: {
        src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h96/h06/10061741654046/huntsman-v3-tkl-8khz-500x500.png',
        alt: 'Razer Huntsman V3 Tenkeyless 8KHz keyboard',
        width: 500,
        height: 500,
      },
      title: 'Razer Huntsman V3 Tenkeyless 8KHz',
      price: 'US$169.99',
      originalPrice: '',
      discount: '',
      url: 'https://www.razer.com/gaming-keyboards/razer-huntsman-v3-tenkeyless-8khz/RZ03-05750200-R3U1',
      ctaLabel: 'View details',
    },
    {
      image: {
        src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h9d/h5d/10039373168670/viper-v4-pro-black-2-500x500.png',
        alt: 'Razer Viper V4 Pro mouse in black',
        width: 500,
        height: 500,
      },
      title: 'Razer Viper V4 Pro Black',
      price: 'US$159.99',
      originalPrice: '',
      discount: '',
      url: 'https://www.razer.com/gaming-mice/razer-viper-v4-pro/RZ01-05630100-R3U1',
      ctaLabel: 'View details',
    },
    {
      image: {
        src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h3c/h54/9941151088670/blackshark-v3-pro-black-500x500.png',
        alt: 'Razer BlackShark V3 Pro headset in black',
        width: 500,
        height: 500,
      },
      title: 'Razer BlackShark V3 Pro Black',
      price: 'US$249.99',
      originalPrice: '',
      discount: '',
      url: 'https://www.razer.com/gaming-headsets/razer-blackshark-v3-pro/RZ04-05400100-R3U1',
      ctaLabel: 'View details',
    },
  ],
};

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);
}

function cellValue(content = '', raw = false) {
  return { content, raw };
}

function row(values) {
  const cells = values.map(({ content, raw }) => (
    `<td>${raw ? content : escapeHTML(content)}</td>`
  )).join('');
  return `          <tr>${cells}</tr>`;
}

function settingRows() {
  return Object.entries(SETTINGS).map(([key, settingValue]) => row([
    cellValue('setting'),
    cellValue(key),
    cellValue(settingValue),
  ]));
}

function contentRows() {
  const rows = [
    row([
      cellValue('product'),
      cellValue(CONTENT.product.sku),
      cellValue(CONTENT.product.color),
      cellValue(CONTENT.product.title),
      cellValue(CONTENT.product.subtitle),
      cellValue(CONTENT.product.price),
      cellValue(CONTENT.product.originalPrice),
      cellValue(CONTENT.product.discount),
      cellValue(CONTENT.product.url),
      cellValue(CONTENT.product.pickup),
    ]),
  ];

  CONTENT.gallery.forEach((image, index) => {
    rows.push(row([
      cellValue('gallery-image'),
      cellValue(`gallery-${String(index + 1).padStart(2, '0')}`),
      cellValue('true'),
      cellValue(''),
      cellValue(image.width),
      cellValue(image.height),
    ]));
  });

  CONTENT.optionGroups.forEach((group) => {
    rows.push(row([
      cellValue('option-group'),
      cellValue(group.key),
      cellValue('true'),
      cellValue(group.label),
    ]));
    group.options.forEach((option) => {
      rows.push(row([
        cellValue('option'),
        cellValue(group.key),
        cellValue(option.key),
        cellValue('true'),
        cellValue(option.label),
        cellValue(option.price || ''),
        cellValue(String(option.selected === true)),
      ]));
    });
  });

  CONTENT.delivery.forEach((item, index) => {
    rows.push(row([
      cellValue('delivery'),
      cellValue(`delivery-${String(index + 1).padStart(2, '0')}`),
      cellValue('true'),
      cellValue(item.label),
      cellValue(item.value),
    ]));
  });

  CONTENT.trust.forEach((text, index) => {
    rows.push(row([
      cellValue('trust'),
      cellValue(`trust-${String(index + 1).padStart(2, '0')}`),
      cellValue('true'),
      cellValue(text),
    ]));
  });

  CONTENT.highlights.forEach((text, index) => {
    rows.push(row([
      cellValue('highlight'),
      cellValue(`highlight-${String(index + 1).padStart(2, '0')}`),
      cellValue('true'),
      cellValue(text),
    ]));
  });

  CONTENT.relatedProducts.forEach((product, index) => {
    rows.push(row([
      cellValue('related-product'),
      cellValue(`related-${String(index + 1).padStart(2, '0')}`),
      cellValue('true'),
      cellValue(''),
      cellValue(product.title),
      cellValue(product.price),
      cellValue(product.originalPrice),
      cellValue(product.discount),
      cellValue(product.url),
      cellValue(product.ctaLabel),
    ]));
  });

  return rows;
}

function createHandoff() {
  const blockRows = [...settingRows(), ...contentRows()].join('\n');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Razer Minipage Block 3 DA.live Handoff</title>
  </head>
  <body>
    <div>
      <table>
        <tbody>
          <tr><td>razer-minipage-block3</td></tr>
${blockRows}
        </tbody>
      </table>
    </div>

    <div>
      <table>
        <tbody>
          <tr><td>Metadata</td></tr>
          <tr><td>Title</td><td>${escapeHTML(CONTENT.metadata.title)}</td></tr>
          <tr><td>Description</td><td>${escapeHTML(CONTENT.metadata.description)}</td></tr>
          <tr>
            <td>Image</td>
            <td><img src="${escapeHTML(CONTENT.metadata.image)}" alt="${escapeHTML(CONTENT.metadata.title)}" width="500" height="500"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
`;
}

const starterTable = `razer-minipage-block3
setting\tcontent-mode\tmerge
product\t${CONTENT.product.sku}\t${CONTENT.product.color}\t${CONTENT.product.title}\t${CONTENT.product.subtitle}\t${CONTENT.product.price}\t\t\t${CONTENT.product.url}\t${CONTENT.product.pickup}
`;

await Promise.all([
  writeFile(join(DIRECTORY, 'razer-minipage-block3-da-live.html'), createHandoff()),
  writeFile(join(DIRECTORY, 'razer-minipage-block3-table.txt'), starterTable),
]);
