import React, { useState } from "react";
import Header from "./components/Header/Header.jsx";
import Tabs from "./components/Tabs/Tabs.jsx";
import CategoryAccordion from "./components/CategoryAccordion/CategoryAccordion.jsx";
import ProductCard from "./components/ProductCard/ProductCard.jsx";
import Dialog from "./components/Dialog/Dialog.jsx";
import AdminPanel from "./components/AdminPanel/AdminPanel.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage";
import "./styles/app.css";

const LS_KEY = "tg-shop-data-v2";

export default function App() {
  // 1. Инициализация Telegram WebApp API
  const tg = window?.Telegram?.WebApp ?? null;

  // 2. Можно вызвать tg.ready(), чтобы Telegram корректно инициализировал WebApp
  React.useEffect(() => {
    tg?.ready && tg.ready();
  }, [tg]);

  const [data, setData] = useLocalStorage(LS_KEY, () => ({
    categories: [
      {
        id: crypto.randomUUID(),
        name: "Steam",
        icon: "/icons/steam.png",
        products: [
          { id: crypto.randomUUID(), name: "Пополнение баланса", price: "", image: "/icons/replenish.png", requiresLogin: true },
          { id: crypto.randomUUID(), name: "Gift Card", price: "", image: "/icons/gift-card.png", requiresLogin: false }
        ]
      },
      // ... остальные категории
    ]
  }));

  const [tab, setTab] = useState("shop");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selection, setSelection] = useState({ category: null, product: null });

  // 3. Пример функции отправки данных в бот через tg.sendData
  const sendToTelegramBot = (payload) => {
    if (tg && tg.sendData) {
      tg.sendData(JSON.stringify(payload));
      // Можно показать уведомление/alert
      alert("Данные отправлены в Telegram бот!");
    } else {
      alert("WebApp API не инициализирован! Откройте приложение через Telegram.");
    }
  };

  // 4. Модифицируем addCategory: после добавления категории отправим её в бот
  const addCategory = (cat) => {
    setData((prev) => ({
      ...prev,
      categories: [{ id: crypto.randomUUID(), products: [], ...cat }, ...prev.categories]
    }));
    // Вызываем отправку данных в бот
    sendToTelegramBot({ event: "addCategory", category: cat });
  };

  // 5. Можно добавить отдельную тестовую кнопку для отправки произвольных данных
  // Например, прямо в рендере:
  // <button onClick={() => sendToTelegramBot({ test: "hello from webapp" })}>Отправить тестовые данные в бот</button>

  const removeCategory = (id) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id)
    }));
    sendToTelegramBot({ event: "removeCategory", categoryId: id });
  };
  const addProduct = (categoryId, prod) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? { ...c, products: [{ id: crypto.randomUUID(), ...prod }, ...c.products] }
          : c
      )
    }));
    sendToTelegramBot({ event: "addProduct", categoryId, product: prod });
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
    sendToTelegramBot({ event: "removeProduct", categoryId, productId });
  };

  const categories = data.categories;

  return (
    <div className="app">
      <Header />
      <Tabs value={tab} onChange={setTab} />

      {/* Тестовая кнопка для отправки данных в бот */}
      <button
        style={{ position: "fixed", top: 10, right: 10, zIndex: 1000 }}
        onClick={() => sendToTelegramBot({ test: "hello from webapp" })}
      >
        Отправить тестовые данные в бот
      </button>

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
      />
    </div>
  );
}