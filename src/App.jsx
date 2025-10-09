import React, { useCallback, useState } from "react";
import Header from "./components/Header/Header.jsx";
import Tabs from "./components/Tabs/Tabs.jsx";
import CategoryAccordion from "./components/CategoryAccordion/CategoryAccordion.jsx";
import ProductCard from "./components/ProductCard/ProductCard.jsx";
import Dialog from "./components/Dialog/Dialog.jsx";
import AdminPanel from "./components/AdminPanel/AdminPanel.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage";
//import { useTelegram } from "./telegram/useTelegram";
import "./styles/app.css";

const LS_KEY = "tg-shop-data-v2"; // ВАЖНО: поменяли ключ, чтобы не брать старые .svg из localStorage

export default function App() {
  const tg = window?.Telegram?.WebApp ?? null;

  // 2. Можно вызвать tg.ready(), чтобы Telegram корректно инициализировал WebApp
  React.useEffect(() => {
    tg?.ready && tg.ready();
  }, [tg]);

  async function submitForm(payload) {
    const body = { payload, initData: tg.initData };

    const res = await fetch('https://tetrasyllabical-unestablishable-betsey.ngrok-free.dev/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      tg.showAlert(`Ошибка: ${res.status} ${t}`);
      return;
    }

    const data = await res.json();
    tg.showPopup({ title: 'Готово', message: data.message || 'ОК', buttons: [{ type: 'close' }] });
  }

  const [data, setData] = useLocalStorage(LS_KEY, () => ({
    categories: [
      {
        id: crypto.randomUUID(),
        name: "Steam",
        icon: "/icons/steam.png",
        products: [
          { id: crypto.randomUUID(), name: "Пополнение баланса", price: "", image: "/icons/replenish.png", requiresPassword: true },
          { id: crypto.randomUUID(), name: "Gift Card", price: "", image: "/icons/gift-card.png", requiresPassword: false }
        ]
      },
      {
        id: crypto.randomUUID(),
        name: "Netflix",
        icon: "/icons/netflix.png",
        products: [
          { id: crypto.randomUUID(), name: "Basic", price: "670", image: "/icons/subscription.png", requiresPassword: true },
          { id: crypto.randomUUID(), name: "Standard", price: "960", image: "/icons/subscription.png", requiresPassword: true },
          { id: crypto.randomUUID(), name: "Premium", price: "1150", image: "/icons/subscription.png", requiresPassword: true }
        ]
      },
      {
        id: crypto.randomUUID(),
        name: "Spotify",
        icon: "/icons/spotify.png",
        products: [
          { id: crypto.randomUUID(), name: "Premium", price: "399", image: "/icons/subscription.png", requiresPassword: true }
        ]
      }
    ]
  }));



  const [tab, setTab] = useState("shop");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selection, setSelection] = useState({ category: null, product: null });

  const openCheckout = useCallback((category, product) => {
    setSelection({ category, product });
    setCheckoutOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  // Admin ops
  const addCategory = async (cat) => {
    const catId = crypto.randomUUID();
    setData((prev) => ({
      ...prev,
      categories: [{ id: catId, products: [], ...cat }, ...prev.categories]
    }));

    await submitForm({ type: "addCategory", category: {id: catId, ...cat }});
  };

  const removeCategory = (id) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id)
    }));
  };

  const addProduct = async (categoryId, prod) => {
    const prodId = crypto.randomUUID();
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? { ...c, products: [{ id: prodId, ...prod }, ...c.products] }
          : c
      )
    }));

    await submitForm({type: "addProduct", product: {categoryId, id: prodId, ...prod }});
  };
  const removeProduct = (categoryId, productId) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? { ...c, products: c.products.filter((p) => p.id !== productId) }
          : c
      )
    }));
  };

  const categories = data.categories;

  return (
    <div className="app">
      <Header />
      <Tabs value={tab} onChange={setTab} />

      {tab === "shop" && (
        <div className="shop">
          {categories.map((cat) => (
            <CategoryAccordion key={cat.id} title={cat.name} icon={cat.icon}>
              <div className="product-grid">
                {cat.products.length === 0 && <div className="empty">Нет товаров</div>}
                {cat.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    name={p.name}
                    price={p.price}
                    image={p.image}
                    onClick={() => openCheckout(cat, p)}
                  />
                ))}
              </div>
            </CategoryAccordion>
          ))}
        </div>
      )}

      {tab === "admin" && (
        <AdminPanel
          data={data}
          addCategory={addCategory}
          addProduct={addProduct}
          removeCategory={removeCategory}
          removeProduct={removeProduct}
        />
      )}

      <Dialog
        isOpen={checkoutOpen}
        onClose={closeCheckout}
        service={selection.category?.name}
        product={selection.product?.name}
        requiresPassword={selection.product?.requiresPassword}
      />
    </div>
  );
}