/* eslint-disable max-len */

/**
 * Canonical content for the Basilisk V3 Pro 35K minipage preset.
 *
 * The source prototype lives in the sibling Razer workspace. Keeping the
 * content in a separate module makes the block decorator readable and gives
 * future presets a clear data contract without exposing hundreds of authored
 * fields in DA.live.
 */
const BASILISK_V3_PRO_35K = {
  id: 'basilisk-v3-pro-35k',
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
    price: 'US$129.99',
    originalPrice: 'US$159.99',
    discount: '18% off',
    url: 'https://www.razer.com/gaming-mice/razer-basilisk-v3-pro-35k/RZ01-05240100-R3U1',
    gallery: [
      {
        src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h8b/hf1/9821719822366/241001-basilisk-v3-pro-35k-1500x1000-1.jpg',
        alt: 'Razer Basilisk V3 Pro 35K mouse in black, three-quarter top view',
        width: 1500,
        height: 1000,
      },
      {
        src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h23/hee/9821719920670/241001-basilisk-v3-pro-35k-1500x1000-2.jpg',
        alt: 'Razer Basilisk V3 Pro 35K mouse in black, left-side view',
        width: 1500,
        height: 1000,
      },
      {
        src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/hdd/hf0/9821719887902/241001-basilisk-v3-pro-35k-1500x1000-3.jpg',
        alt: 'Razer Basilisk V3 Pro 35K mouse in black, right-side view',
        width: 1500,
        height: 1000,
      },
      {
        src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/hc1/he1/9822093901854/241001-basilisk-v3-pro-35k-3-1500x1000-4.jpg',
        alt: 'Razer Basilisk V3 Pro 35K mouse showing its RGB underglow',
        width: 1500,
        height: 1000,
      },
      {
        src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/hcc/hed/9821719953438/241001-basilisk-v3-pro-35k-1500x1000-5.jpg',
        alt: 'Razer Basilisk V3 Pro 35K mouse viewed from the rear',
        width: 1500,
        height: 1000,
      },
      {
        src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h34/hf1/9821719855134/241001-basilisk-v3-pro-35k-1500x1000-6.jpg',
        alt: 'Razer Basilisk V3 Pro 35K mouse viewed from below',
        width: 1500,
        height: 1000,
      },
    ],
    optionGroups: [
      {
        label: 'Color / Design',
        options: [
          { label: 'Black', selected: true },
          { label: 'White', price: '+US$30.00' },
          { label: 'Phantom Green Edition', price: '+US$40.00' },
          { label: 'Phantom White Edition', price: '+US$40.00' },
        ],
      },
      {
        label: 'Model',
        options: [
          { label: 'Basilisk V3 Pro 35K', selected: true },
          { label: '+ Mouse Dock Pro', price: '+US$35.00' },
          { label: '+ Wireless Charging Puck', price: '+US$15.00' },
        ],
      },
      {
        label: 'Add RazerCare Protection',
        options: [
          { label: 'RazerCare Elite For Mice', price: '+US$29.99' },
          { label: 'No, Thank You', selected: true },
        ],
      },
    ],
    delivery: [
      { label: 'Jul 21–Jul 22', value: 'US$15.00' },
      { label: 'Jul 24–Jul 28', value: 'Free' },
    ],
    pickup: 'Available stock(s) in 10 RazerStore(s)',
    trust: [
      'Next Business Day Shipping',
      'Risk Free Return',
      'Comprehensive Customer Support',
    ],
  },
  highlights: [
    'Configurable Razer™ HyperScroll Tilt Wheel',
    'Razer™ Focus Pro 35K Optical Sensor Gen-2',
    'Up to 140 Hours on Razer™ HyperSpeed Wireless',
  ],
  features: [
    {
      side: 'right',
      media: [
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/c576a2204094a7fae6faac108107bf4b/razer-basilisk-v3-pro-35k-hero-desktop.webp',
          alt: 'Razer Basilisk V3 Pro 35K illuminated in green against a dark backdrop',
          width: 1774,
          height: 646,
        },
      ],
      eyebrow: 'Razer Basilisk V3 Pro 35K',
      title: 'The Apex of Immersion and Customization',
      paragraphs: [
        'Push immersion and control further with an ergonomic wireless RGB mouse built around Razer’s most precise sensor and a deeply configurable scroll wheel.',
      ],
    },
    {
      side: 'left',
      media: [
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/3ea0425e244221a5e7a0972c0fa91270/razer-basilisk-v3-pro-insane-attributes-desktop-v3.webp',
          alt: 'Razer Basilisk V3 Pro 35K attribute overview',
          width: 1774,
          height: 646,
        },
      ],
      title: 'Insane Attributes, Potent Peformance',
      bullets: [
        { lead: 'STR 100', text: 'Razer Optical Mouse Switches Gen-3' },
        { lead: 'AGI 100', text: 'Razer HyperSpeed Wireless' },
        { lead: 'INT 100', text: 'Razer HyperScroll Tilt Wheel' },
        { lead: 'VIT 100(110)', text: 'Next-Gen Wireless Charging' },
        { lead: 'DEX 120', text: 'Razer Focus Pro 35K Sensor Gen-2' },
        { lead: 'CHR 100', text: 'Razer Chroma RGB' },
      ],
    },
    {
      side: 'right',
      media: [
        {
          src: 'https://razer.app.baqend.com/v1/file/www/videoPoster/613aa0bd9ec4ea47c616d2acf992f1066fa478bc79737c24ae229df766503aea.avif?bqoptimize=1',
          alt: 'Close-up of the configurable Razer HyperScroll tilt wheel',
          width: 1920,
          height: 1080,
        },
      ],
      title: 'Configurable Razer™ HyperScroll Tilt Wheel',
      subtitle: '4-way Scroll Wheel With 3 Unique Modes',
      paragraphs: [
        'Move between precise notched steps, unrestricted free-spin scrolling, or Smart-Reel switching that responds to scroll speed in Synapse 4.',
      ],
      bullets: [
        { lead: 'Tactile Cycling Mode', text: 'Distinct steps for precise weapon or skill selection.' },
        { lead: 'Free-Spin Scrolling Mode', text: 'Fast, fluid movement through long content or repeated commands.' },
        { lead: 'Smart-Reel Mode', text: 'Automatically changes from tactile to free-spin as scrolling accelerates.' },
        { lead: 'Virtual Acceleration', text: 'Increases scroll rate progressively for quicker navigation.' },
      ],
      link: {
        label: 'Learn more',
        href: 'https://www.razer.com/technology/razer-scroll-wheels#hyperscroll-tilt-wheel',
      },
    },
    {
      side: 'left',
      media: [
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/9e619ef2150e173fdc89d47482d6b088/hoverimagepanel-460px-synapse-1.webp',
          alt: 'Synapse 4 Smart-Reel configuration panel',
          width: 460,
          height: 700,
        },
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/9e619ef2150e173fdc89d47482d6b088/hoverimagepanel-460px-synapse-2.webp',
          alt: 'Synapse 4 adjustable scroll acceleration panel',
          width: 460,
          height: 700,
        },
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/9e619ef2150e173fdc89d47482d6b088/hoverimagepanel-460px-synapse-3.webp',
          alt: 'Synapse 4 DPI sensitivity matcher panel',
          width: 460,
          height: 700,
        },
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/9e619ef2150e173fdc89d47482d6b088/razer-hypershift.webp',
          alt: 'Razer HyperShift control mapping panel',
          width: 460,
          height: 700,
        },
      ],
      title: 'Cutting-Edge Customization on Synapse 4',
      bullets: [
        { lead: 'Smart-Reel Mode', text: 'Select one of five force thresholds for automatic tactile-to-free-spin switching.' },
        { lead: 'Adjustable Scroll Acceleration', text: 'Pick from five multipliers to move through content at the preferred rate.' },
        { lead: 'DPI Sensitivity Matcher', text: 'Transfer the feel of an existing mouse with precise DPI matching.' },
        { lead: 'Razer HyperShift', text: 'Add a secondary mapping to each of 13 controls and switch functions instantly.' },
      ],
    },
    {
      side: 'right',
      media: [
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/80752294896099799dac5326a154c532/razer-basilisk-v3-pro-35k-hero-phantom-desktop.webp',
          alt: 'Phantom Green Razer Basilisk V3 Pro 35K showing multi-zone RGB underglow',
          width: 1774,
          height: 646,
        },
      ],
      title: '12-Zone Chroma Lighting With Full Underglow',
      subtitle: 'Powered by Razer Chroma™ RGB',
      paragraphs: [
        'Program every lighting zone with a palette of 16.8 million colors and effects that respond to hundreds of Chroma-integrated games.',
      ],
      bullets: [
        { lead: '12', text: 'individually programmable LEDs' },
        { lead: '300+', text: 'Chroma-integrated games' },
        { lead: '16.8 million', text: 'colors' },
      ],
    },
    {
      side: 'left',
      media: [
        {
          src: 'https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h23/hee/9821719920670/241001-basilisk-v3-pro-35k-1500x1000-2.jpg',
          alt: 'Side profile of the Razer Basilisk V3 Pro 35K highlighting sensor precision',
          width: 1500,
          height: 1000,
        },
      ],
      title: 'Razer™ Focus Pro 35K Optical Sensor Gen-2',
      subtitle: 'Best-in-class Precision',
      paragraphs: [
        'Track accurately across a wider range of surfaces, including glass, with intelligent calibration and granular one-DPI adjustments.',
      ],
      bullets: [
        { text: '99.8% resolution accuracy' },
        { text: '35,000 DPI sensitivity' },
        { text: '750 IPS maximum speed' },
        { text: '70 G maximum acceleration' },
      ],
      link: {
        label: 'Learn more',
        href: 'https://www.razer.com/technology/razer-focus-pro-sensor',
      },
    },
    {
      side: 'right',
      media: [
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/6573162ffb25d04baefe46645d08edbd/razer-basilisk-v3-pro-hyperspeed-wireless-desktop.webp',
          alt: 'Razer Basilisk V3 Pro 35K using HyperSpeed multi-device wireless',
          width: 1774,
          height: 646,
        },
      ],
      title: 'Razer™ HyperSpeed Wireless With Multi-Device Support',
      subtitle: 'High-Performance, Low-Latency Gaming',
      paragraphs: [
        'Get responsive low-latency play and connect a compatible Razer mouse and keyboard through one dongle to keep a USB port free.',
      ],
      link: {
        label: 'Learn more',
        href: 'https://www.razer.com/technology/razer-hyperspeed-wireless',
      },
    },
    {
      side: 'left',
      media: [
        {
          src: 'https://assets3.razerzone.com/rW28F-zWsDJD08L4VoIUCUh1QOc=/300x300/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh64%2Fh8e%2F9977389907998%2Fbasilisk-v3-pro-35-black-dock-500x500.png',
          alt: 'Razer Basilisk V3 Pro 35K with Mouse Dock Pro',
          width: 300,
          height: 300,
        },
        {
          src: 'https://assets3.razerzone.com/352_5gZjEaju58GZGyroNGn0Wj8=/300x300/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh16%2Fh8b%2F9857398931486%2Fbasilisk-v3-pro-35k-wireless-charging-puck-black-2-500x500.png',
          alt: 'Razer Basilisk V3 Pro 35K with Wireless Charging Puck',
          width: 300,
          height: 300,
        },
        {
          src: 'https://assets3.razerzone.com/IGLejpy9uJjP2M8FsPZTU6rZ-Jg=/300x300/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh5a%2Fh1c%2F9821720576030%2Fbasilisk-v3-pro-35k-500x500.png',
          alt: 'Razer Basilisk V3 Pro 35K mouse',
          width: 300,
          height: 300,
        },
      ],
      title: 'Choose Your Loadout',
      bullets: [
        { lead: 'Razer Basilisk V3 Pro 35K + Mouse Dock Pro', text: 'Add US$35.00' },
        { lead: 'Razer Basilisk V3 Pro 35K + Wireless Charging Puck', text: 'Add US$15.00' },
        { lead: 'Razer Basilisk V3 Pro 35K', text: 'US$129.99' },
      ],
    },
    {
      side: 'right',
      media: [
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/d3371cc6e20599b954ba63b040a87a4f/advanced-features-phantom-460x700-1.webp',
          alt: 'Razer Basilisk V3 Pro 35K customizable controls',
          width: 460,
          height: 700,
        },
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/d3371cc6e20599b954ba63b040a87a4f/advanced-features-phantom-460x700-2.webp',
          alt: 'Razer Basilisk V3 Pro 35K HyperSpeed wireless battery performance',
          width: 460,
          height: 700,
        },
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/d3371cc6e20599b954ba63b040a87a4f/advanced-features-phantom-460x700-3.webp',
          alt: 'Razer optical mouse switches Gen-3',
          width: 460,
          height: 700,
        },
      ],
      title: 'More Advanced Features',
      detailGroups: [
        {
          title: '13 Customizable Controls',
          lead: 'Limitless Configurations.',
          text: 'Map commands and macros across 13 accessible controls, including the multi-function trigger.',
        },
        {
          title: 'Up to 140 Hours on Razer™ HyperSpeed Wireless',
          lead: 'High-Performance, Low-Latency Gaming.',
          text: 'Keep playing wirelessly or add compatible hardware to unlock true 8000 Hz polling.',
        },
        {
          title: 'Razer™ Optical Mouse Switches Gen-3',
          lead: 'Unrivaled Durability and Speed.',
          text: 'A 90-million-click lifecycle and 0.2 ms actuation deliver fast, dependable input without debounce delay.',
        },
      ],
    },
    {
      side: 'left',
      media: [
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/fd7c5f9454e6e15fd6aef47db6a67dcb/hyperflux-v2-wireless-charging-system-500x500.webp',
          alt: 'Razer HyperFlux V2 Wireless Charging System',
          width: 500,
          height: 500,
        },
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/9dab0cee6e29131910a0d0119ec030bc/razer-mouse-dock-pro-500x500.webp',
          alt: 'Razer Mouse Dock Pro',
          width: 500,
          height: 500,
        },
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/9dab0cee6e29131910a0d0119ec030bc/razer-wireless-charging-puck-500x500.webp',
          alt: 'Razer Wireless Charging Puck',
          width: 500,
          height: 500,
        },
      ],
      title: 'Upgrade to Next-Gen Wireless Charging',
      subtitle: 'Compatible With Razer and Select Wireless Chargers*',
      paragraphs: [
        'Add seamless inductive charging with one of these separately sold accessories:',
      ],
      bullets: [
        { lead: 'Razer HyperFlux V2 Wireless Charging System', text: 'Charging mouse mat with a dedicated puck.' },
        { lead: 'Razer Mouse Dock Pro', text: 'Includes the Razer Wireless Charging Puck.' },
        { lead: 'Razer Wireless Charging Puck', text: 'Works with Razer wireless chargers and select inductive chargers.' },
      ],
      note: '*Other inductive chargers may work when their coils are aligned correctly.',
    },
    {
      side: 'right',
      media: [
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/e2bec1209eb7c2a2532f3d25ef2fe457/basilisk-v3-pro-35k-phantom-193x275.webp',
          alt: 'Razer Basilisk V3 Pro 35K',
          width: 193,
          height: 275,
        },
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/e2bec1209eb7c2a2532f3d25ef2fe457/comparison-basilisk-v3-pro.webp',
          alt: 'Razer Basilisk V3 Pro',
          width: 193,
          height: 275,
        },
      ],
      title: 'Compare the Difference',
      bullets: [
        { lead: 'HyperSpeed battery:', text: 'up to 140 hours vs. 110 hours' },
        { lead: 'Bluetooth battery:', text: 'up to 210 hours vs. 150 hours' },
        { lead: 'Sensor:', text: 'Focus Pro 35K Gen-2 vs. Focus Pro 30K' },
        { lead: 'Maximum sensitivity:', text: '35,000 DPI vs. 30,000 DPI' },
        { lead: 'DPI Sensitivity Matcher:', text: 'Yes vs. No' },
        { lead: 'Smart-Reel and scroll acceleration configuration:', text: 'Yes vs. No' },
      ],
    },
    {
      side: 'left',
      media: [
        {
          src: 'https://assets2.razerzone.com/images/pnx.assets/eccd7639a9aac85074530a57e8c9b66b/razer-warranty-panel_2y_1920x400.webp',
          alt: 'Razer two-year warranty coverage',
          width: 1920,
          height: 400,
        },
      ],
      title: 'We’ve Got You Covered',
      paragraphs: [
        'Receive up to two years of warranty coverage, dependable technical support, and 14-day risk-free returns when buying directly from RazerStore.',
      ],
    },
  ],
  specifications: [
    { label: 'Color / Design', value: 'Black' },
    { label: 'Model', value: 'Basilisk V3 Pro 35K' },
    { label: 'Form Factor', value: 'Right-Handed' },
    {
      label: 'Connectivity',
      value: ['Razer HyperSpeed Wireless', 'Bluetooth', 'Wired'],
    },
    {
      label: 'Battery Life',
      value: [
        'Up to 140 hours on Razer HyperSpeed Wireless (constant motion at 1000 Hz)',
        'Up to 28 hours with the Razer HyperPolling Wireless Dongle and Mouse Dock Pro* (constant motion at 8000 Hz) *both sold separately',
        'Up to 210 hours on Bluetooth',
      ],
    },
    { label: 'RGB Lighting', value: 'Razer Chroma™ RGB (Scroll Wheel, Logo, Multi-zone Underglow)' },
    { label: 'Sensor', value: 'Focus Pro 35K Optical Sensor Gen-2' },
    { label: 'Max Sensitivity (DPI)', value: '35000' },
    { label: 'Max Speed (IPS)', value: '750' },
    { label: 'Max Acceleration (G)', value: '70' },
    { label: 'Programmable Buttons', value: '11' },
    { label: 'Switch Type', value: 'Optical Mouse Switches Gen-3' },
    { label: 'Switch Lifecycle', value: '90-million Clicks' },
    { label: 'On-board Memory Profiles', value: '5' },
    { label: 'Mouse Feet', value: '100% PTFE' },
    { label: 'Cable', value: 'USB Type A to USB Type C Cable' },
    {
      label: 'Tilt Scroll Wheel',
      value: [
        '4-Way Razer™ HyperScroll Tilt Wheel',
        'Electronically Actuated Notched and Free-Spinning Modes',
        'Smart-Reel Mode Configurable on Synapse',
      ],
    },
    {
      label: 'Size',
      value: [
        'Length: 130.0 mm / 5.11 in',
        'Width: 75.1 mm / 2.95 in',
        'Height: 42.5 mm / 1.67 in',
      ],
    },
    { label: 'Weight', value: '112 g / 3.95 oz (Excluding dongle and cable)' },
    { label: 'Accessory Compatibility', value: 'Razer Mouse Dock Pro with Razer Wireless Charging Puck* (both sold separately)' },
    {
      label: 'Box Contents',
      value: [
        'Razer Basilisk V3 Pro 35K',
        'HyperSpeed Wireless Dongle + USB Dongle Adapter',
        'USB Type A to USB Type C Cable',
        'Important Product Information Guide',
      ],
    },
  ],
  relatedProducts: [
    {
      image: {
        src: 'https://assets3.razerzone.com/GD7LN6cfkLEjIwC2G5kC6FHPU0s=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh96%2Fh06%2F10061741654046%2Fhuntsman-v3-tkl-8khz-500x500.png',
        alt: 'Razer Huntsman V3 Tenkeyless 8KHz keyboard',
        width: 1500,
        height: 1000,
      },
      title: 'Razer Huntsman V3 Tenkeyless 8KHz',
      price: 'US$169.99',
      url: 'https://www.razer.com/gaming-keyboards/razer-huntsman-v3-tenkeyless-8khz/RZ03-05750200-R3U1',
    },
    {
      image: {
        src: 'https://assets3.razerzone.com/yS2YqsLqlniIGwFNx-wUmtOu7bU=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh9d%2Fh5d%2F10039373168670%2Fviper-v4-pro-black-2-500x500.png',
        alt: 'Razer Viper V4 Pro mouse in black',
        width: 1500,
        height: 1000,
      },
      title: 'Razer Viper V4 Pro Black',
      price: 'US$159.99',
      url: 'https://www.razer.com/gaming-mice/razer-viper-v4-pro/RZ01-05630100-R3U1',
    },
    {
      image: {
        src: 'https://assets3.razerzone.com/wzr-vb-Zrs40WXZTpUn1ZE8Yy24=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh3c%2Fh54%2F9941151088670%2Fblackshark-v3-pro-black-500x500.png',
        alt: 'Razer BlackShark V3 Pro headset in black',
        width: 1500,
        height: 1000,
      },
      title: 'Razer BlackShark V3 Pro Black',
      price: 'US$249.99',
      url: 'https://www.razer.com/gaming-headsets/razer-blackshark-v3-pro/RZ04-05400100-R3U1',
    },
    {
      image: {
        src: 'https://assets3.razerzone.com/NoiqmILH2ZnV-k57mMtQ3G8p8_U=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh8c%2Fh49%2F10003777191966%2Fiskur-v2-newgen-black-500x500.png',
        alt: 'Razer Iskur V2 NewGen gaming chair in black',
        width: 1500,
        height: 1000,
      },
      title: 'Razer Iskur V2 NewGen Black',
      price: 'US$649.99',
      url: 'https://www.razer.com/gaming-chairs/razer-iskur-v2-newgen/RZ38-04900800-R3US',
    },
    {
      image: {
        src: 'https://assets3.razerzone.com/o91KHpGHLpTxppNyjx4lh7c2TXc=/1500x1000/https%3A%2F%2Fmedias-p1.phoenix.razer.com%2Fsys-master-phoenix-images-container%2Fh6e%2Fh3a%2F9945965625374%2Fwolverine-v3-pro-8k-pc-black-500x500.png',
        alt: 'Razer Wolverine V3 Pro 8K PC controller in black',
        width: 1500,
        height: 1000,
      },
      title: 'Razer Wolverine V3 Pro 8K PC Black',
      price: 'US$169.99',
      originalPrice: 'US$199.99',
      discount: '15% off',
      url: 'https://www.razer.com/console-controllers/razer-wolverine-v3-pro-8k-pc/RZ06-05540100-R3U1',
    },
  ],
};

export default BASILISK_V3_PRO_35K;
