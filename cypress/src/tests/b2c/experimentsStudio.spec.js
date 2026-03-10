describe('Experiments Studio', () => {
  it('renders the studio and creates a draft experiment', () => {
    cy.visit('/tools/experiments-studio/');
    cy.contains('DA.Live Experimentation Command Center');
    cy.contains('button', 'New').click();
    cy.contains('Untitled experiment');
    cy.get('input[data-root-field="name"]').clear().type('Homepage link test');
    cy.contains('Homepage link test');
  });
});
