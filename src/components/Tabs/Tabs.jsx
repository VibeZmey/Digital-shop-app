import React, { useEffect, useState } from "react";
import "./Tabs.css";

export default function Tabs({ value, onChange }) {
  const [userId, setUserId] = useState(null);
  const ADMIN_IDS = process.env.REACT_APP_ADMIN_IDS.split(',').map(id => parseInt(id, 10));

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    setUserId(tg?.initDataUnsafe?.user?.id ?? null);
  }, []);

  const isAdmin = userId != null && ADMIN_IDS.includes(userId);

  return (
    <div className="tabs">
      <button
        className={value === "shop" ? "tab active" : "tab"}
        onClick={() => onChange("shop")}
      >
        Магазин
      </button>

      <button
        className={value === "orders" ? "tab active" : "tab"}
        onClick={() => onChange("orders")}
      >
        Мои заказы
      </button>

      {isAdmin && (
        <button
          className={value === "admin" ? "tab active" : "tab"}
          onClick={() => onChange("admin")}
        >
          Админ
        </button>
      )}
    </div>
  );
}