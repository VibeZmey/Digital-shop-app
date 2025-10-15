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

const CACHE_KEY_PRODUCTS = 'shop_data';
const CACHE_KEY_ORDERS = 'orders';
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export default function App() {
  const {tg} = useTelegram();

  useEffect(() => {
    if (tg?.ready) {
      tg.ready();
      // Начинаем загрузку данных сразу после ready
      loadAllData();
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

  const [data, setData] = useState({ categories: [], orders: [] });
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await fetch(`https://tetrasyllabical-unestablishable-betsey.ngrok-free.dev/api/order?initData=${encodeURIComponent(window.Telegram.WebApp.initData)}`, {
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
        setData((prev) => ({ ...prev, orders: result.data.orders}));
        localStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(result.data.orders));
        localStorage.setItem(`${CACHE_KEY_ORDERS}_time`, Date.now().toString());
        console.log('Заказы сохранены в кеш');
      }
    }catch (error) {
      console.error('Ошибка загрузки заказов:', error);

      const cachedOrders = localStorage.getItem(CACHE_KEY_ORDERS);

      if (cachedOrders) {
        console.log('Загружаем устаревший кеш заказов как fallback');
        setData((prev) => ({ ...prev, orders: JSON.parse(cachedOrders)}));
        tg?.showAlert('Показаны сохранённые данные. Проверьте подключение.');
      } else {
        setData((prev) => ({ ...prev, orders: []}));
        tg?.showAlert(`Ошибка: ${error.message}`);
      }
    }


  }

  const loadAllData = async (forceRefresh = false) => {
    setIsLoading(true);

    try {
      if (!forceRefresh) {
        const cachedProducts = localStorage.getItem(CACHE_KEY_PRODUCTS);
        const cachedOrders = localStorage.getItem(CACHE_KEY_ORDERS);
        const cacheProductsTime = localStorage.getItem(`${CACHE_KEY_PRODUCTS}_time`);
        const cacheOrdersTime = localStorage.getItem(`${CACHE_KEY_ORDERS}_time`);

        if (cachedProducts && cacheProductsTime && cachedOrders && cacheOrdersTime) {
          const ageProducts = Date.now() - parseInt(cacheProductsTime);
          const ageOrders = Date.now() - parseInt(cacheOrdersTime);

          if ((ageProducts < CACHE_DURATION) || (ageOrders < CACHE_DURATION)) {
            if(ageOrders < CACHE_DURATION){
              console.log('Заказы загружены из кеша');
              setData((prev) => ({ ...prev, orders: JSON.parse(cachedOrders)}));
              console.log(cachedOrders);
            }
            if(ageProducts < CACHE_DURATION){
              console.log('Продукты загружены из кеша');
              setData((prev) => ({ ...prev, categories: JSON.parse(cachedProducts)}));
              console.log(cachedProducts);
            }
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
        setData(result.data);
        // Сохраняем в кеш
        localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(result.data.categories));
        localStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(result.data.orders));
        localStorage.setItem(`${CACHE_KEY_PRODUCTS}_time`, Date.now().toString());
        localStorage.setItem(`${CACHE_KEY_ORDERS}_time`, Date.now().toString());

        console.log('Данные сохранены в кеш');
      }

    } catch (error) {
      console.error('Ошибка загрузки:', error);

      // Пытаемся загрузить из кеша даже если он устарел
      const cachedProducts = localStorage.getItem(CACHE_KEY_PRODUCTS);
      const cachedOrders = localStorage.getItem(CACHE_KEY_ORDERS);

      if (cachedProducts && cachedOrders) {
        console.log('Загружаем устаревший кеш как fallback');
        setData({categories: JSON.parse(cachedProducts), orders: JSON.parse(cachedOrders)});
        tg?.showAlert('Показаны сохранённые данные. Проверьте подключение.');
      } else {
        setData({ categories: [], orders: [] });
        tg?.showAlert(`Ошибка: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }


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
  const orders = data.orders;

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
            orders.map((order) => (
              <OrderCard
                order={order}
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
        loadOrders={loadOrders}
      />
    </div>
  );
}