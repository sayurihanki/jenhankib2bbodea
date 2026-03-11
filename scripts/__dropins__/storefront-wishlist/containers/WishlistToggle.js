/*! Copyright 2026 Adobe
All Rights Reserved. */
import { jsx } from '@dropins/tools/preact-jsx-runtime.js';
import { useState, useCallback, useEffect } from '@dropins/tools/preact-compat.js';
import { Button, Icon } from '@dropins/tools/components.js';
import { events } from '@dropins/tools/event-bus.js';
import { useText } from '@dropins/tools/i18n.js';
import {
  s as state,
  g as getPersistedWishlistData,
  i as isMatchingWishlistItem,
  r as removeProductsFromWishlist,
} from '../chunks/removeProductsFromWishlist.js';
import {
  c as config,
  a as addProductsToWishlist,
} from '../chunks/mergeWishlists.js';
import { S as HeartFilled } from '../chunks/HeartFilled.js';
import { S as Heart } from '../chunks/Heart.js';
import '@dropins/tools/fetch-graphql.js';
import '@dropins/tools/lib.js';

function getProductOptionUIDs(product) {
  return product.optionUIDs
    ?? (product.selectedOptionsUIDs ? Object.values(product.selectedOptionsUIDs) : undefined)
    ?? (product.bundleOptionsUIDs ? Object.values(product.bundleOptionsUIDs) : undefined);
}

function getEnteredOptions(product) {
  if (Array.isArray(product?.enteredOptions) && product.enteredOptions.length > 0) {
    return product.enteredOptions;
  }

  if (product?.options?.items) {
    return product.options.items
      .filter((option) => option.selected)
      .map((option) => ({
        uid: option.uid,
        value: option.value,
      }));
  }

  return undefined;
}

function WishlistToggle({
  product,
  iconWishlisted,
  iconToWishlist,
  size,
  variant,
  disabled,
  labelToWishlist,
  labelWishlisted,
  onClick,
  removeProdFromCart,
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(state.authenticated);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItem, setWishlistItem] = useState(null);
  const { isGuestWishlistEnabled } = config.getConfig();
  const dictionary = useText({
    addToWishlist: 'Wishlist.Wishlist.ariaLabelAddToWishlist',
    removeFromWishlist: 'Wishlist.Wishlist.ariaLabelRemoveFromWishlist',
  });

  const handleWishlistData = useCallback(() => {
    const updatedWishlist = getPersistedWishlistData();
    const item = updatedWishlist?.items?.find((wishlistItemEntry) => isMatchingWishlistItem(
      wishlistItemEntry,
      {
        sku: product.topLevelSku ?? product.sku,
        optionUIDs: getProductOptionUIDs(product),
      },
    ));

    setWishlistItem(item ?? null);
    setIsWishlisted(Boolean(item));
  }, [
    product.topLevelSku,
    product.sku,
    product.optionUIDs,
    product.selectedOptionsUIDs,
    product.bundleOptionsUIDs,
  ]);

  useEffect(() => {
    handleWishlistData();
  }, [handleWishlistData]);

  useEffect(() => {
    const onAuthenticated = events.on('authenticated', (authenticated) => {
      setIsLoggedIn(authenticated);
    });
    const onWishlistData = events.on('wishlist/data', handleWishlistData);

    return () => {
      onAuthenticated?.off?.();
      onWishlistData?.off?.();
    };
  }, [handleWishlistData]);

  const handleToggle = async () => {
    if (isWishlisted) {
      try {
        await removeProductsFromWishlist([wishlistItem]);
      } catch {
        events.emit('wishlist/alert', {
          action: 'removeError',
          item: { product },
        });
        return null;
      }

      setIsWishlisted(false);
      events.emit('wishlist/alert', {
        action: 'remove',
        item: { product },
      });

      return null;
    }

    try {
      await addProductsToWishlist([{
        sku: product.topLevelSku ?? product.sku,
        quantity: 1,
        optionsUIDs: getProductOptionUIDs(product),
        enteredOptions: getEnteredOptions(product),
      }]);
    } catch {
      events.emit('wishlist/alert', {
        action: 'addError',
        item: { product },
      });
      return null;
    }

    setIsWishlisted(true);
    events.emit('wishlist/alert', {
      action: 'add',
      item: { product },
    });

    if (removeProdFromCart) {
      await removeProdFromCart([{
        uid: product.uid,
        quantity: 0,
      }]);
    }

    return null;
  };

  if (!isLoggedIn && !isGuestWishlistEnabled) {
    return null;
  }

  const ariaLabel = isWishlisted
    ? dictionary.removeFromWishlist.replace('{PRODUCT_NAME}', product?.name)
    : dictionary.addToWishlist.replace('{PRODUCT_NAME}', product?.name);

  return jsx(Button, {
    active: isWishlisted,
    'aria-label': ariaLabel,
    'data-testid': 'wishlist-toggle',
    size: size ?? 'medium',
    variant: variant ?? 'tertiary',
    disabled,
    icon: jsx(Icon, { source: iconToWishlist ?? Heart }),
    activeIcon: jsx(Icon, { source: iconWishlisted ?? HeartFilled }),
    onClick: onClick ?? handleToggle,
    children: labelToWishlist,
    activeChildren: labelWishlisted,
  });
}

export { WishlistToggle };
export default WishlistToggle;
