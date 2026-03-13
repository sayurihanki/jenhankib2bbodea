const STEP_LABELS = ['Military Life', 'Interests', 'Communication'];

const SERVICE_STATUS_OPTIONS = [
  ['active_duty', 'Active Duty'],
  ['spouse_dependent', 'Spouse / Dependent'],
  ['veteran_retiree', 'Veteran / Retiree'],
  ['dod_civilian', 'DoD / Coast Guard Civilian'],
];

const INSTALLATION_OPTIONS = [
  ['', 'Select your primary installation'],
  ['camp_pendleton', 'Camp Pendleton, CA'],
  ['camp_lejeune', 'Camp Lejeune, NC'],
  ['quantico', 'Marine Corps Base Quantico, VA'],
  ['twentynine_palms', 'MCAGCC Twentynine Palms, CA'],
  ['camp_butler', 'MCB Camp Butler, Okinawa'],
  ['cherry_point', 'MCAS Cherry Point, NC'],
  ['miramar', 'MCAS Miramar, CA'],
  ['parris_island', 'MCRD Parris Island, SC'],
  ['san_diego', 'MCRD San Diego, CA'],
  ['iwakuni', 'MCAS Iwakuni, Japan'],
  ['kaneohe_bay', 'MCB Hawaii (Kaneohe Bay)'],
  ['albany', 'MCLB Albany, GA'],
  ['barstow', 'MCLB Barstow, CA'],
  ['new_river', 'MCAS New River, NC'],
  ['beaufort', 'MCAS Beaufort, SC'],
  ['henderson_hall', 'Henderson Hall, VA'],
  ['other', 'Other / Not listed'],
];

const BRANCH_OPTIONS = [
  ['', 'Select branch'],
  ['usmc', 'U.S. Marine Corps'],
  ['navy', 'U.S. Navy'],
  ['army', 'U.S. Army'],
  ['air_force', 'U.S. Air Force'],
  ['space_force', 'U.S. Space Force'],
  ['coast_guard', 'U.S. Coast Guard'],
  ['civilian', 'Civilian / N/A'],
];

const RANK_OPTIONS = [
  ['', 'Select rank category'],
  ['enlisted_junior', 'Enlisted (E1-E3)'],
  ['enlisted_nco', 'NCO (E4-E5)'],
  ['enlisted_snco', 'SNCO (E6-E9)'],
  ['warrant', 'Warrant Officer'],
  ['officer_company', 'Company Grade Officer (O1-O3)'],
  ['officer_field', 'Field Grade Officer (O4-O6)'],
  ['officer_general', 'General / Flag Officer (O7+)'],
  ['civilian', 'Civilian / N/A'],
];

const HOUSEHOLD_OPTIONS = [
  ['', 'Select household size'],
  ['1', 'Just me'],
  ['2', '2 people'],
  ['3', '3 people'],
  ['4', '4 people'],
  ['5', '5 people'],
  ['6+', '6+ people'],
];

const SPOUSE_OPTIONS = [
  ['', 'Select one'],
  ['yes', 'Yes'],
  ['no', 'No'],
  ['na', 'N/A'],
];

const SERVICE_STATUS_LABELS = Object.fromEntries(SERVICE_STATUS_OPTIONS);
const FREQUENCY_LABELS = {
  realtime: 'Real-time offers',
  weekly: 'Weekly digest',
  monthly: 'Monthly roundup',
  minimal: 'Essential updates only',
};

function controlId(key) {
  return `mp-${key}`;
}

function fieldId(key) {
  return `mp-field-${key}`;
}

function messageId(key) {
  return `mp-msg-${key}`;
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  Object.entries(props).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === 'className') node.className = value;
    else if (key === 'textContent') node.textContent = value;
    else if (key === 'htmlFor') node.setAttribute('for', value);
    else if (key === 'ariaLive') node.setAttribute('aria-live', value);
    else if (key === 'attributes') {
      Object.entries(value).forEach(([attr, attrValue]) => {
        node.setAttribute(attr, attrValue);
      });
    } else {
      node[key] = value;
    }
  });

  const childList = Array.isArray(children) ? children : [children];
  childList.forEach((child) => {
    if (child === undefined || child === null) return;
    if (typeof child === 'string') node.append(child);
    else node.append(child);
  });

  return node;
}

function createFieldChrome({
  key,
  label,
  required = false,
  optional = false,
  wide = false,
}) {
  const field = el('div', {
    className: `mp-field${wide ? ' mp-field--wide' : ''}`,
    id: fieldId(key),
  });
  const header = el('div', { className: 'mp-field__header' });
  const labelRow = el('div', { className: 'mp-field__label' }, label);

  if (required) {
    labelRow.append(el('span', {
      className: 'mp-field__required',
      textContent: 'Required',
    }));
  } else if (optional) {
    labelRow.append(el('span', {
      className: 'mp-field__optional',
      textContent: 'Optional',
    }));
  }

  header.append(labelRow);
  field.append(header);

  return {
    field,
    message: el('p', {
      className: 'mp-field__message',
      id: messageId(key),
      ariaLive: 'polite',
    }),
  };
}

function createSelectField({
  key,
  name,
  label,
  options,
  required = false,
  optional = false,
  wide = false,
}) {
  const { field, message } = createFieldChrome({
    key,
    label,
    required,
    optional,
    wide,
  });
  const shell = el('div', { className: 'mp-select-wrap' });
  const select = el('select', {
    className: 'mp-input mp-select',
    id: controlId(key),
    name,
    required,
  });
  select.setAttribute('data-error-key', key);

  options.forEach(([value, text]) => {
    select.append(el('option', {
      value,
      textContent: text,
    }));
  });

  shell.append(
    select,
    el('span', { className: 'mp-select-wrap__arrow', textContent: 'v' }),
  );
  field.append(shell, message);
  return field;
}

function createTextAreaField({
  key,
  name,
  label,
  placeholder,
  maxLength,
  required = false,
  optional = false,
  wide = false,
}) {
  const { field, message } = createFieldChrome({
    key,
    label,
    required,
    optional,
    wide,
  });
  const textArea = el('textarea', {
    className: 'mp-input mp-textarea',
    id: controlId(key),
    name,
    placeholder,
    required,
    maxLength,
    rows: 5,
  });
  textArea.setAttribute('data-error-key', key);

  const counter = el('div', {
    className: 'mp-field__counter',
    id: `${controlId(key)}-counter`,
    textContent: `0 / ${maxLength}`,
  });

  textArea.addEventListener('input', () => {
    const count = textArea.value.length;
    counter.textContent = `${count} / ${maxLength}`;
    counter.classList.toggle('is-warning', count >= Math.floor(maxLength * 0.85));
  });

  field.append(textArea, counter, message);
  return field;
}

function createChoiceGroup({
  key,
  name,
  label,
  type,
  choices,
  required = false,
  optional = false,
  wide = true,
}) {
  const { field, message } = createFieldChrome({
    key,
    label,
    required,
    optional,
    wide,
  });
  const grid = el('div', { className: 'mp-choice-grid' });

  choices.forEach(([value, text], index) => {
    const id = `${controlId(key)}-${index}`;
    const input = el('input', {
      id,
      type,
      name,
      value,
      className: 'mp-choice-grid__input',
    });
    input.setAttribute('data-error-key', key);

    const choiceClass = type === 'radio' ? 'mp-chip mp-chip--radio' : 'mp-chip';
    const labelNode = el('label', {
      className: choiceClass,
      htmlFor: id,
      textContent: text,
    });
    grid.append(input, labelNode);
  });

  field.append(grid, message);
  return field;
}

function createToggleField(name, title, copy) {
  const label = el('label', { className: 'mp-toggle' });
  const input = el('input', {
    className: 'mp-toggle__input',
    type: 'checkbox',
    name,
  });
  const copyWrap = el('span', { className: 'mp-toggle__copy' }, [
    el('span', { className: 'mp-toggle__title', textContent: title }),
    el('span', { className: 'mp-toggle__body', textContent: copy }),
  ]);

  label.append(
    input,
    copyWrap,
    el('span', { className: 'mp-toggle__track' }, [
      el('span', { className: 'mp-toggle__thumb' }),
    ]),
  );

  return label;
}

function createDivider(text) {
  return el('div', { className: 'mp-divider' }, [
    el('span', { textContent: text }),
  ]);
}

function createProgress() {
  const progress = el('div', { className: 'mp-progress' });

  STEP_LABELS.forEach((stepLabel, index) => {
    const step = index + 1;
    const item = el('div', {
      className: `mp-progress__item${step === 1 ? ' is-current' : ''}`,
      id: `mp-progress-${step}`,
    });

    item.append(
      el('div', { className: 'mp-progress__badge', textContent: String(step) }),
      el('div', { className: 'mp-progress__label', textContent: stepLabel }),
    );

    if (step < STEP_LABELS.length) {
      item.append(el('div', {
        className: 'mp-progress__line',
        id: `mp-progress-line-${step}`,
      }));
    }

    progress.append(item);
  });

  return progress;
}

function buildStepOne() {
  const step = el('section', {
    className: 'mp-step-panel is-active',
    id: 'mp-step-1',
    attributes: { 'data-step': '1' },
  });
  const grid = el('div', { className: 'mp-grid' });

  step.append(
    el('div', { className: 'mp-step__eyebrow', textContent: 'Step 1 of 3' }),
    el('h2', { className: 'mp-step__title', textContent: 'Your military life' }),
    el('p', {
      className: 'mp-step__body',
      textContent: 'Help MCCS understand your day-to-day context so we can surface the most relevant shopping, recreation, and family support programs.',
    }),
  );

  grid.append(
    createChoiceGroup({
      key: 'service-status',
      name: 'serviceStatus',
      label: 'Service status',
      type: 'radio',
      choices: SERVICE_STATUS_OPTIONS,
      required: true,
    }),
    createSelectField({
      key: 'installation',
      name: 'installation',
      label: 'Primary installation',
      options: INSTALLATION_OPTIONS,
      required: true,
      wide: true,
    }),
    createSelectField({
      key: 'branch',
      name: 'branch',
      label: 'Branch',
      options: BRANCH_OPTIONS,
      optional: true,
    }),
    createSelectField({
      key: 'rank-category',
      name: 'rankCategory',
      label: 'Rank category',
      options: RANK_OPTIONS,
      optional: true,
    }),
    createDivider('Household'),
    createChoiceGroup({
      key: 'children-ages',
      name: 'childrenAges',
      label: 'Children in household',
      type: 'checkbox',
      optional: true,
      choices: [
        ['infant', 'Infant / Toddler (0-2)'],
        ['preschool', 'Preschool (3-4)'],
        ['school_age', 'School Age (5-12)'],
        ['teen', 'Teen (13-17)'],
        ['none', 'No children'],
      ],
    }),
    createSelectField({
      key: 'household-size',
      name: 'householdSize',
      label: 'Household size',
      options: HOUSEHOLD_OPTIONS,
      optional: true,
    }),
    createSelectField({
      key: 'spouse-service',
      name: 'spouseService',
      label: 'Spouse on active duty?',
      options: SPOUSE_OPTIONS,
      optional: true,
    }),
    createDivider('Upcoming milestones'),
    createChoiceGroup({
      key: 'milestones',
      name: 'milestones',
      label: 'Upcoming milestones',
      type: 'checkbox',
      optional: true,
      choices: [
        ['pcs', 'PCS / Relocation'],
        ['deployment', 'Deployment'],
        ['new_baby', 'New baby'],
        ['rank_change', 'Promotion / Rank change'],
        ['retirement', 'Retirement / Transition'],
        ['back_to_school', 'Back to school'],
        ['none', 'None right now'],
      ],
    }),
  );

  step.append(
    grid,
    el('div', { className: 'mp-nav' }, [
      el('span', { className: 'mp-nav__spacer' }),
      el('button', {
        className: 'mp-button mp-button--primary',
        id: 'mp-next-1',
        type: 'button',
        textContent: 'Continue',
      }),
    ]),
  );

  return step;
}

function buildStepTwo() {
  const step = el('section', {
    className: 'mp-step-panel',
    id: 'mp-step-2',
    attributes: { 'data-step': '2' },
  });
  const grid = el('div', { className: 'mp-grid' });

  step.append(
    el('div', { className: 'mp-step__eyebrow', textContent: 'Step 2 of 3' }),
    el('h2', { className: 'mp-step__title', textContent: 'Shopping and recreation' }),
    el('p', {
      className: 'mp-step__body',
      textContent: 'Choose the categories, events, and support programs you want MCCS to prioritize across your shopping and recreation experience.',
    }),
  );

  const toggleGroup = createFieldChrome({
    key: 'services',
    label: 'Programs you want to hear about',
    optional: true,
    wide: true,
  });
  const toggles = el('div', { className: 'mp-toggle-list' });

  [
    ['svc_childcare', 'Childcare and CDC', 'School Age Care, CDC waitlists, and youth programming.'],
    ['svc_financial', 'Financial readiness', 'Budgeting, debt management, and financial counseling.'],
    ['svc_education', 'Education and tuition assistance', 'Scholarships, tuition help, and career development.'],
    ['svc_career', 'Career transition and employment', 'Transition Readiness, spouse employment, and job events.'],
    ['svc_relocation', 'Relocation and newcomer support', 'PCS assistance, orientation, and welcome programs.'],
    ['svc_counseling', 'Prevention and counseling', 'Wellness, stress support, and relationship resources.'],
  ].forEach(([name, title, copy]) => {
    toggles.append(createToggleField(name, title, copy));
  });

  toggleGroup.field.append(toggles, toggleGroup.message);

  grid.append(
    createChoiceGroup({
      key: 'shop-categories',
      name: 'shopCategories',
      label: 'MCX shopping interests',
      type: 'checkbox',
      optional: true,
      choices: [
        ['uniforms', 'Uniforms and service wear'],
        ['electronics', 'Electronics and gaming'],
        ['outdoor', 'Outdoor and fitness gear'],
        ['home', 'Home and household'],
        ['branded', 'Marine-branded merch'],
        ['cosmetics', 'Cosmetics and personal care'],
        ['kids', 'Kids and family'],
        ['firearms', 'Firearms and accessories'],
      ],
    }),
    createDivider('MWR and ITT'),
    createChoiceGroup({
      key: 'mwr-interests',
      name: 'mwrInterests',
      label: 'Recreation interests',
      type: 'checkbox',
      optional: true,
      choices: [
        ['bowling', 'Bowling'],
        ['golf', 'Golf'],
        ['fitness', 'Fitness / Gym'],
        ['outdoor_rec', 'Camping and outdoor recreation'],
        ['marina', 'Marina and water sports'],
        ['youth_sports', 'Youth sports and activities'],
        ['arts_crafts', 'Arts and crafts'],
        ['auto_skills', 'Auto skills'],
      ],
    }),
    createChoiceGroup({
      key: 'ticket-interests',
      name: 'ticketInterests',
      label: 'Tickets and events',
      type: 'checkbox',
      optional: true,
      choices: [
        ['theme_parks', 'Theme parks'],
        ['sporting_events', 'Sporting events'],
        ['concerts', 'Concerts and shows'],
        ['local_attractions', 'Local attractions'],
        ['travel', 'Leisure travel'],
      ],
    }),
    createDivider('Life services'),
    toggleGroup.field,
  );

  step.append(
    grid,
    el('div', { className: 'mp-nav' }, [
      el('button', {
        className: 'mp-button mp-button--ghost',
        id: 'mp-back-2',
        type: 'button',
        textContent: 'Back',
      }),
      el('button', {
        className: 'mp-button mp-button--primary',
        id: 'mp-next-2',
        type: 'button',
        textContent: 'Continue',
      }),
    ]),
  );

  return step;
}

function buildStepThree() {
  const step = el('section', {
    className: 'mp-step-panel',
    id: 'mp-step-3',
    attributes: { 'data-step': '3' },
  });
  const grid = el('div', { className: 'mp-grid' });

  step.append(
    el('div', { className: 'mp-step__eyebrow', textContent: 'Step 3 of 3' }),
    el('h2', { className: 'mp-step__title', textContent: 'Communication preferences' }),
    el('p', {
      className: 'mp-step__body',
      textContent: 'Choose how you want MCCS to reach you and how you prefer to fulfill orders and offers.',
    }),
  );

  const consentChrome = createFieldChrome({
    key: 'consent',
    label: 'Privacy consent',
    required: true,
    wide: true,
  });
  const consentLabel = el('label', { className: 'mp-consent' });
  const consentInput = el('input', {
    className: 'mp-consent__input',
    id: controlId('consent'),
    type: 'checkbox',
    name: 'consent',
    value: 'yes',
  });
  consentInput.setAttribute('data-error-key', 'consent');
  consentLabel.append(
    consentInput,
    el('span', { className: 'mp-consent__box' }),
    el('span', { className: 'mp-consent__text' }, [
      'I consent to MCCS using my preferences to personalize my experience in line with the ',
      el('a', {
        className: 'mp-inline-link',
        href: '#',
        textContent: 'MCCS Privacy Policy',
      }),
      '.',
    ]),
  );
  consentChrome.field.append(consentLabel, consentChrome.message);

  grid.append(
    createChoiceGroup({
      key: 'channels',
      name: 'channels',
      label: 'Preferred channels',
      type: 'checkbox',
      required: true,
      choices: [
        ['email', 'Email'],
        ['sms', 'SMS / Text'],
        ['push', 'Push notifications'],
        ['inapp', 'In-app notifications'],
      ],
    }),
    createChoiceGroup({
      key: 'frequency',
      name: 'frequency',
      label: 'Message frequency',
      type: 'radio',
      optional: true,
      choices: [
        ['realtime', 'Real-time offers'],
        ['weekly', 'Weekly digest'],
        ['monthly', 'Monthly roundup'],
        ['minimal', 'Only essential updates'],
      ],
    }),
    createDivider('Fulfillment'),
    createChoiceGroup({
      key: 'fulfillment',
      name: 'fulfillment',
      label: 'Preferred fulfillment',
      type: 'radio',
      optional: true,
      choices: [
        ['bopis', 'Pick up at my base MCX'],
        ['ship_home', 'Ship to my address'],
        ['no_pref', 'No preference'],
      ],
    }),
    createDivider('Anything else'),
    createTextAreaField({
      key: 'notes',
      name: 'notes',
      label: 'Additional notes',
      placeholder: 'Special interests, accessibility needs, or feedback on your MCCS experience.',
      maxLength: 500,
      optional: true,
      wide: true,
    }),
    consentChrome.field,
  );

  step.append(
    grid,
    el('div', { className: 'mp-nav' }, [
      el('button', {
        className: 'mp-button mp-button--ghost',
        id: 'mp-back-3',
        type: 'button',
        textContent: 'Back',
      }),
      el('button', {
        className: 'mp-button mp-button--primary',
        id: 'mp-submit',
        type: 'button',
        textContent: 'Save my preferences',
      }),
    ]),
  );

  return step;
}

function getNamedInputs(block, name) {
  return [...block.querySelectorAll('input')].filter((input) => input.name === name);
}

function getCheckedValues(block, name) {
  return getNamedInputs(block, name)
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function getCheckedValue(block, name) {
  return getCheckedValues(block, name)[0] || '';
}

function getSelectText(select) {
  const match = [...select.querySelectorAll('option')].find((option) => option.value === select.value);
  return match ? match.textContent : '';
}

function setError(block, key, message) {
  const field = block.querySelector(`#${fieldId(key)}`);
  const messageNode = block.querySelector(`#${messageId(key)}`);
  if (field) field.classList.add('is-error');
  if (messageNode) messageNode.textContent = message;
}

function clearError(block, key) {
  const field = block.querySelector(`#${fieldId(key)}`);
  const messageNode = block.querySelector(`#${messageId(key)}`);
  if (field) field.classList.remove('is-error');
  if (messageNode) messageNode.textContent = '';
}

function validateChoiceRequired(block, key, name, message) {
  const hasSelection = getCheckedValues(block, name).length > 0;
  if (!hasSelection) {
    setError(block, key, message);
    return false;
  }
  clearError(block, key);
  return true;
}

function validateSelectRequired(block, key, message) {
  const select = block.querySelector(`#${controlId(key)}`);
  if (!select || !select.value) {
    setError(block, key, message);
    return false;
  }
  clearError(block, key);
  return true;
}

function validateCheckboxRequired(block, key, message) {
  const input = block.querySelector(`#${controlId(key)}`);
  if (!input || !input.checked) {
    setError(block, key, message);
    return false;
  }
  clearError(block, key);
  return true;
}

function setStep(block, nextStep) {
  [...block.querySelectorAll('.mp-step-panel')].forEach((panel, index) => {
    panel.classList.toggle('is-active', index + 1 === nextStep);
  });

  STEP_LABELS.forEach((_, index) => {
    const step = index + 1;
    const item = block.querySelector(`#mp-progress-${step}`);
    const line = block.querySelector(`#mp-progress-line-${step}`);
    if (!item) return;

    item.classList.toggle('is-current', step === nextStep);
    item.classList.toggle('is-complete', step < nextStep);
    if (line) line.classList.toggle('is-complete', step < nextStep);
  });
}

function splitHeading(title) {
  const parts = title.split(/\n|<br\s*\/?>/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) return [title.trim(), ''];
  return [parts[0], parts.slice(1).join(' ')];
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildSuccessCard(block, redirectUrl) {
  const installationSelect = block.querySelector(`#${controlId('installation')}`);
  const status = getCheckedValue(block, 'serviceStatus');
  const frequency = getCheckedValue(block, 'frequency');
  const chips = [
    `Service: ${SERVICE_STATUS_LABELS[status] || 'Not set'}`,
    `Installation: ${installationSelect ? getSelectText(installationSelect) : 'Not set'}`,
    `Shopping interests: ${getCheckedValues(block, 'shopCategories').length}`,
    `Recreation interests: ${getCheckedValues(block, 'mwrInterests').length}`,
    `Frequency: ${FREQUENCY_LABELS[frequency] || 'Not set'}`,
  ];

  const card = el('div', { className: 'mp-success' });
  const chipList = el('div', { className: 'mp-success__chips' });

  chips.forEach((chip) => {
    chipList.append(el('div', { className: 'mp-success__chip', textContent: chip }));
  });

  card.append(
    el('div', { className: 'mp-success__crest', textContent: 'MCCS' }),
    el('h2', { className: 'mp-success__title', textContent: 'Preferences saved' }),
    el('p', {
      className: 'mp-success__body',
      textContent: 'Your profile is ready for a more tailored MCCS experience across shopping, recreation, and family programming.',
    }),
    chipList,
  );

  if (redirectUrl) {
    const countdown = el('div', { className: 'mp-countdown' });
    const ring = el('div', { className: 'mp-countdown__ring' });
    const number = el('span', { className: 'mp-countdown__value', textContent: '5' });
    const copy = el('p', {
      className: 'mp-countdown__copy',
      textContent: 'Redirecting to your next MCCS experience in 5 seconds.',
    });
    const goNow = el('button', {
      className: 'mp-button mp-button--ghost mp-button--small',
      type: 'button',
      textContent: 'Go now',
    });

    let remaining = 5;
    ring.style.setProperty('--mp-progress', '1');

    const interval = setInterval(() => {
      remaining -= 1;
      const progress = Math.max(remaining / 5, 0);
      ring.style.setProperty('--mp-progress', String(progress));
      number.textContent = String(Math.max(remaining, 0));
      copy.textContent = `Redirecting to your next MCCS experience in ${Math.max(remaining, 0)} seconds.`;

      if (remaining <= 0) {
        clearInterval(interval);
        window.location.href = redirectUrl;
      }
    }, 1000);

    goNow.addEventListener('click', () => {
      clearInterval(interval);
      window.location.href = redirectUrl;
    });

    countdown.append(
      el('div', { className: 'mp-countdown__visual' }, [
        el('div', { className: 'mp-countdown__stack' }, [ring, number]),
      ]),
      copy,
      goNow,
    );
    card.append(countdown);
  }

  return card;
}

function attachErrorResetHandlers(block) {
  [...block.querySelectorAll('input'), ...block.querySelectorAll('select'), ...block.querySelectorAll('textarea')]
    .forEach((input) => {
      input.addEventListener('change', () => {
        const errorKey = input.getAttribute('data-error-key');
        if (errorKey) clearError(block, errorKey);
      });
      input.addEventListener('input', () => {
        const errorKey = input.getAttribute('data-error-key');
        if (errorKey) clearError(block, errorKey);
      });
    });
}

export default function decorate(block) {
  const rows = [...block.children];
  const title = rows[0]?.textContent?.trim() || 'Personalize\nyour MCCS experience';
  const subtitle = rows[1]?.textContent?.trim() || 'Tell us about your military life, interests, and communication preferences so MCCS can tailor the experience around you.';
  const redirectUrl = rows[2]?.querySelector('a')?.getAttribute('href') || '';
  const [titleLineOne, titleAccent] = splitHeading(title);

  block.textContent = '';

  const shell = el('div', { className: 'mp-shell' });
  const hero = el('div', { className: 'mp-hero' });
  const titleNode = el('h1', { className: 'mp-hero__title' }, titleLineOne);

  if (titleAccent) {
    titleNode.append(
      el('span', {
        className: 'mp-hero__accent',
        textContent: titleAccent,
      }),
    );
  }

  hero.append(
    el('div', { className: 'mp-hero__badge', textContent: 'MCCS Patron Preferences' }),
    titleNode,
    el('p', { className: 'mp-hero__body', textContent: subtitle }),
    createProgress(),
  );

  const formWrap = el('div', { className: 'mp-form-wrap' });
  const formPanels = el('div', { className: 'mp-panels' }, [
    buildStepOne(),
    buildStepTwo(),
    buildStepThree(),
  ]);
  const successWrap = el('div', { className: 'mp-success-wrap' });

  formWrap.append(formPanels, successWrap);
  shell.append(hero, formWrap);

  block.append(
    el('div', { className: 'mp-grid-overlay' }),
    el('div', { className: 'mp-noise-overlay' }),
    el('div', { className: 'mp-orb mp-orb--scarlet' }),
    el('div', { className: 'mp-orb mp-orb--gold' }),
    el('div', { className: 'mp-orb mp-orb--navy' }),
    shell,
  );

  attachErrorResetHandlers(block);

  let currentStep = 1;

  block.querySelector('#mp-next-1').addEventListener('click', () => {
    const serviceOk = validateChoiceRequired(
      block,
      'service-status',
      'serviceStatus',
      'Please select your service status.',
    );
    const installationOk = validateSelectRequired(
      block,
      'installation',
      'Please select your primary installation.',
    );

    if (!serviceOk || !installationOk) return;

    currentStep = 2;
    setStep(block, currentStep);
  });

  block.querySelector('#mp-back-2').addEventListener('click', () => {
    currentStep = 1;
    setStep(block, currentStep);
  });

  block.querySelector('#mp-next-2').addEventListener('click', () => {
    currentStep = 3;
    setStep(block, currentStep);
  });

  block.querySelector('#mp-back-3').addEventListener('click', () => {
    currentStep = 2;
    setStep(block, currentStep);
  });

  block.querySelector('#mp-submit').addEventListener('click', async () => {
    const channelsOk = validateChoiceRequired(
      block,
      'channels',
      'channels',
      'Please choose at least one preferred channel.',
    );
    const consentOk = validateCheckboxRequired(
      block,
      'consent',
      'Please accept to continue.',
    );

    if (!channelsOk || !consentOk) return;

    const button = block.querySelector('#mp-submit');
    button.disabled = true;
    button.classList.add('is-loading');
    button.textContent = 'Saving...';

    await wait(900);

    formPanels.style.display = 'none';
    successWrap.append(buildSuccessCard(block, redirectUrl));
    button.disabled = false;
    button.classList.remove('is-loading');
    button.textContent = 'Save my preferences';
  });
}
