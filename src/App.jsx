import React, {useCallback, useEffect, useState} from "react";
import Header from "./components/Header/Header.jsx";
import Tabs from "./components/Tabs/Tabs.jsx";
import CategoryAccordion from "./components/CategoryAccordion/CategoryAccordion.jsx";
import ProductCard from "./components/ProductCard/ProductCard.jsx";
import Dialog from "./components/Dialog/Dialog.jsx";
import AdminPanel from "./components/AdminPanel/AdminPanel.jsx";
import OrderCard from "./components/OrderCard/OrderCard.jsx";
import { useTelegram } from "./telegram/useTelegram";
import "./styles/app.css";

const CACHE_KEY = 'shop_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export default function App() {
  const {tg} = useTelegram();

  React.useEffect(() => {
    if (tg?.ready) {
      tg.ready();
      // Начинаем загрузку данных сразу после ready
      loadData();
    }
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
    }
  }

  const [data, setData] = useState({ categories: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState({ orders: [] });

  const loadData = async (forceRefresh = false) => {
    setIsLoading(true);

    try {
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        const cacheTime = localStorage.getItem(`${CACHE_KEY}_time`);

        if (cached && cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age < CACHE_DURATION) {
            console.log('Загружено из кеша');
            setData(JSON.parse(cached));
            setIsLoading(false);
            return;
          }
        }
      }
      // валидация get через query
      const response = await fetch(`https://tetrasyllabical-unestablishable-betsey.ngrok-free.dev/api/shop-data?initData=${encodeURIComponent(window.Telegram.WebApp.initData)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (!response.ok) {
        console.log("Ошибка");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data.categories);
        setOrders(result.data.orders);
        // Сохраняем в кеш
        localStorage.setItem(CACHE_KEY, JSON.stringify(result.data));
        localStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString());

        console.log('Данные сохранены в кеш');
      }

    } catch (error) {
      console.error('Ошибка загрузки:', error);

      // Пытаемся загрузить из кеша даже если он устарел
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        console.log('Загружаем устаревший кеш как fallback');
        setData(JSON.parse(cached));
        tg?.showAlert('Показаны сохранённые данные. Проверьте подключение.');
      } else {
        setData({ categories: [] });
        tg?.showAlert(`Ошибка: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    loadData();
  }, [])


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

  const removeCategory = async (id) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id)
    }));
    await submitForm({ type: "removeCategory", id});
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
  const removeProduct = async (categoryId, productId) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? { ...c, products: c.products.filter((p) => p.id !== productId) }
          : c
      )
    }));

    await submitForm({ type: "removeProduct", id: productId });
  };

  const categories = data.categories;

  return (
    <div className="app">
      <Header />
      <Tabs value={tab} onChange={setTab} />

      {tab === "shop" && (
        <div className="shop">
          {isLoading ? <div className="empty">Загрузка товаров...</div> :
          categories.map((cat) => (
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
      {tab === "orders" &&(
        <div className="orders">
          {orders.length === 0 && (<div className="empty">Нет заказов</div>)}
          {isLoading ? <div className="empty">Загрузка заказов...</div> :
            orders.orders.map((order) => (
              <OrderCard
                name={order.name}
                price={order.price}
                image={order.image}
                status={order.status}
                onClick={()=>{}}
              />
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
        service={selection.category}
        product={selection.product}
        requiresPassword={selection.product?.requiresPassword}
      />
    </div>
  );
}