import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks';
import { useToast } from './ToastContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [items, setItems] = useLocalStorage('relicverse_favorites', []);
  const toast = useToast();

  const toggle = useCallback((product) => {
    let added = false;
    setItems((list) => {
      if (list.some((i) => i.id === product.id)) return list.filter((i) => i.id !== product.id);
      added = true;
      return [{
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.images?.[0] || '/products/placeholder.svg',
        universe: product.universe,
        rating: product.rating,
        stock: product.stock,
        onSale: product.onSale,
        discount: product.discount,
        addedAt: new Date().toISOString(),
      }, ...list];
    });
    // setItems სინქრონულია — შეტყობინება უსაფრთხოდ იგზავნება მიკროტასკში
    queueMicrotask(() => {
      if (added) toast.success('პროდუქტი დაემატა რჩეულებში', product.name);
      else toast.info('პროდუქტი წაიშალა რჩეულებიდან');
    });
  }, [setItems, toast]);

  const remove = useCallback((id) => {
    setItems((list) => list.filter((i) => i.id !== id));
    toast.info('პროდუქტი წაიშალა რჩეულებიდან');
  }, [setItems, toast]);

  const clear = useCallback(() => {
    setItems([]);
    toast.info('რჩეულების სია გასუფთავდა');
  }, [setItems, toast]);

  const value = useMemo(() => ({
    items,
    count: items.length,
    toggle, remove, clear,
    has: (id) => items.some((i) => i.id === id),
  }), [items, toggle, remove, clear]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites უნდა გამოიყენოთ FavoritesProvider-ის შიგნით');
  return ctx;
}
