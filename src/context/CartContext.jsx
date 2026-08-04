import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'relicverse_cart';
const MAX_QTY = 20;

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage(STORAGE_KEY, []);
  const [promo, setPromo] = useLocalStorage('relicverse_promo_applied', null);
  const toast = useToast();

  const add = useCallback((product, quantity = 1) => {
    if (!product || product.stock <= 0) {
      toast.error('პროდუქტი არ არის მარაგში');
      return false;
    }
    let capped = false;
    setItems((list) => {
      const existing = list.find((i) => i.id === product.id);
      const limit = Math.min(MAX_QTY, product.stock);
      if (existing) {
        const next = Math.min(limit, existing.quantity + quantity);
        capped = next === existing.quantity;
        return list.map((i) => (i.id === product.id ? { ...i, quantity: next } : i));
      }
      return [...list, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.images?.[0] || '/products/placeholder.svg',
        universe: product.universe,
        stock: product.stock,
        quantity: Math.min(limit, quantity),
      }];
    });
    if (capped) toast.info('მარაგში მეტი აღარ არის');
    else toast.success('პროდუქტი დაემატა კალათაში', product.name);
    return true;
  }, [setItems, toast]);

  const setQuantity = useCallback((id, quantity) => {
    setItems((list) => list.map((i) => {
      if (i.id !== id) return i;
      const limit = Math.min(MAX_QTY, i.stock ?? MAX_QTY);
      return { ...i, quantity: Math.max(1, Math.min(limit, quantity)) };
    }));
  }, [setItems]);

  const remove = useCallback((id) => {
    setItems((list) => list.filter((i) => i.id !== id));
    toast.info('პროდუქტი წაიშალა კალათიდან');
  }, [setItems, toast]);

  const clear = useCallback((silent = false) => {
    setItems([]);
    setPromo(null);
    if (!silent) toast.info('კალათა გასუფთავდა');
  }, [setItems, setPromo, toast]);

  const subtotal = useMemo(
    () => Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100,
    [items],
  );

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);

  const discount = useMemo(() => {
    if (!promo) return 0;
    if (promo.minTotal && subtotal < promo.minTotal) return 0;
    const value = promo.type === 'percent' ? (subtotal * promo.value) / 100 : promo.value;
    return Math.round(Math.min(value, subtotal) * 100) / 100;
  }, [promo, subtotal]);

  const value = useMemo(() => ({
    items, count, subtotal, promo, discount,
    add, remove, clear, setQuantity, setPromo,
    has: (id) => items.some((i) => i.id === id),
    quantityOf: (id) => items.find((i) => i.id === id)?.quantity || 0,
  }), [items, count, subtotal, promo, discount, add, remove, clear, setQuantity, setPromo]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart უნდა გამოიყენოთ CartProvider-ის შიგნით');
  return ctx;
}
