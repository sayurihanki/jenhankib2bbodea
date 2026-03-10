/*! Copyright 2026 Adobe
All Rights Reserved. */
const e=`
fragment PRODUCT_OPTION_FRAGMENT on ProductViewOption {
    id
    title
    required
    multi
    values {
      id
      title
      inStock
      __typename
      ... on ProductViewOptionValueProduct {
        title
        quantity
        isDefault
        __typename
        product {
          sku
          shortDescription
          metaDescription
          metaKeyword
          metaTitle
          name
          price {
            final {
              amount {
                value
                currency
              }
            }
            regular {
              amount {
                value
                currency
              }
            }
            roles
          }
        }
      }
      ... on ProductViewOptionValueSwatch {
        id
        title
        type
        value
        inStock
      }
    }
  }
`,t=`
fragment PRODUCT_INPUT_OPTION_FRAGMENT on ProductViewInputOption {
  id
  title
  required
  type
  suffix
  sortOrder
  range {
    from
    to
  }
  imageSize {
    width
    height
  }
  fileExtensions
}
`,r=`
  fragment PRICE_RANGE_FRAGMENT on ComplexProductView {
    priceRange {
      maximum {
        final {
          amount {
            value
            currency
          }
        }
        regular {
          amount {
            value
            currency
          }
        }
        roles
      }
      minimum {
        final {
          amount {
            value
            currency
          }
        }
        regular {
          amount {
            value
            currency
          }
        }
        roles
      }
    }
  }
`,i=`
fragment PRODUCT_FRAGMENT on ProductView {
  __typename
  id
  sku
  name
  shortDescription
  metaDescription
  metaKeyword
  metaTitle
  description
  inStock
  addToCartAllowed
  url
  urlKey
  externalId

  images(roles: []) {
    url
    label
    roles
  }

  attributes(roles: []) {
    name
    label
    value
    roles
  }

  inputOptions {
    ...PRODUCT_INPUT_OPTION_FRAGMENT
  }

... on SimpleProductView {
    price {
        roles

        regular {
            amount {
                value
                currency
            }
        }

        final {
            amount {
                value
                currency
            }
        }
        tiers {
          tier {
            amount {
              value
              currency
            }
          }
          quantity {
            ... on ProductViewTierRangeCondition {
              gte
              lt
            }
          }
        }
      }
    }

  ... on ComplexProductView {
    options {
      ...PRODUCT_OPTION_FRAGMENT
    }

    ...PRICE_RANGE_FRAGMENT
  }
}

${e}
${t}
${r}
`;export{r as PRICE_RANGE_FRAGMENT,i as PRODUCT_FRAGMENT,t as PRODUCT_INPUT_OPTION_FRAGMENT,e as PRODUCT_OPTION_FRAGMENT};
//# sourceMappingURL=fragments.js.map
