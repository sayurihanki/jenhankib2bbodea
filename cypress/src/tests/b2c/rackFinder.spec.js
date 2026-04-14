/* global beforeEach, cy, describe, it */

const productSearchResponse = {
  data: {
    attributeMetadata: {
      filterableInSearch: [],
      sortable: [
        {
          attribute: 'position',
        },
        {
          attribute: 'name',
        },
      ],
    },
    productSearch: {
      total_count: 2,
      facets: [],
      page_info: {
        current_page: 1,
        total_pages: 1,
        total_items: 2,
        page_size: 3,
      },
      items: [
        {
          productView: {
            id: 'rack-a',
            name: 'Bodea Quiet Rack 12U',
            sku: 'BD-SR-QUIET-12U',
            urlKey: 'bodea-quiet-rack-12u',
            externalId: 'rack-a',
            addToCartAllowed: false,
            inStock: true,
            __typename: 'ComplexProductView',
            images: [
              {
                label: 'Bodea Quiet Rack 12U',
                url: 'https://images.example.com/bodea-quiet-rack-12u.jpg',
                roles: [],
              },
            ],
            priceRange: {
              minimum: {
                final: {
                  amount: {
                    value: 1799,
                    currency: 'USD',
                  },
                },
                regular: {
                  amount: {
                    value: 1899,
                    currency: 'USD',
                  },
                },
              },
              maximum: {
                final: {
                  amount: {
                    value: 2299,
                    currency: 'USD',
                  },
                },
                regular: {
                  amount: {
                    value: 2399,
                    currency: 'USD',
                  },
                },
              },
            },
          },
        },
        {
          productView: {
            id: 'rack-b',
            name: 'Bodea Secure Enclosure 24U',
            sku: 'BD-NE-12U-GLASS-24U',
            urlKey: 'bodea-secure-enclosure-24u',
            externalId: 'rack-b',
            addToCartAllowed: false,
            inStock: true,
            __typename: 'ComplexProductView',
            images: [
              {
                label: 'Bodea Secure Enclosure 24U',
                url: 'https://images.example.com/bodea-secure-enclosure-24u.jpg',
                roles: [],
              },
            ],
            priceRange: {
              minimum: {
                final: {
                  amount: {
                    value: 2499,
                    currency: 'USD',
                  },
                },
                regular: {
                  amount: {
                    value: 2599,
                    currency: 'USD',
                  },
                },
              },
              maximum: {
                final: {
                  amount: {
                    value: 2899,
                    currency: 'USD',
                  },
                },
                regular: {
                  amount: {
                    value: 2999,
                    currency: 'USD',
                  },
                },
              },
            },
          },
        },
      ],
    },
  },
};

const secureGrowthAnswerPath = [
  'Branch office or satellite closet',
  '7-12U balanced growth',
  'Security and lockable access',
  'Moderate with occasional changes',
  'Moderate growth in six to twelve months',
];

function completeSecureGrowthPath() {
  secureGrowthAnswerPath.forEach((label) => {
    cy.contains(label).click();
  });
}

describe('Rack finder guided selling', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/graphql*productSearch*', productSearchResponse).as('productSearch');
  });

  it('walks through the rack finder and renders a ranked result state', { tags: '@snapPercy' }, () => {
    cy.viewport(1440, 1200);
    cy.visit('/rack-finder');

    cy.get('.guided-selling-luxe__view--intro').should('be.visible');
    cy.percyTakeSnapshot('Rack Finder Intro Desktop');

    cy.contains('Start the rack finder').should('be.visible').click();
    cy.get('.guided-selling-luxe__answer-grid').should('be.visible');
    cy.percyTakeSnapshot('Rack Finder Answer Step Desktop');

    completeSecureGrowthPath();

    cy.contains('Your primary recommendation').should('be.visible');
    cy.contains('Secure Growth').should('be.visible');
    cy.contains('View collection').should('be.visible');
    cy.wait('@productSearch');
    cy.percyTakeSnapshot('Rack Finder Results Desktop');
  });

  it('keeps the premium layout polished on mobile', { tags: '@snapPercy' }, () => {
    cy.viewport('iphone-6');
    cy.visit('/rack-finder');

    cy.get('.guided-selling-luxe__view--intro').should('be.visible');
    cy.percyTakeSnapshot('Rack Finder Intro Mobile');

    cy.contains('Start the rack finder').should('be.visible').click();
    completeSecureGrowthPath();

    cy.contains('Your primary recommendation').should('be.visible');
    cy.wait('@productSearch');
    cy.percyTakeSnapshot('Rack Finder Results Mobile');
  });

  it('keeps the server-racks PLP and adds the rack-finder entry CTA', () => {
    cy.visit('/server-racks');

    cy.contains('Launch the rack finder')
      .should('be.visible')
      .and('have.attr', 'href', '/rack-finder');

    cy.get('.product-list-page').should('be.visible');
  });
});
