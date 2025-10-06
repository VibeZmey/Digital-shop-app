import { useEffect, useState } from 'react';
import React from "react";
import "./Tabs.css";

export default function Tabs({ value, onChange }) {
  const ADMIN_IDS = process.env.ADMIN_IDS.split(',').map(id => parseInt(id, 10));
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    setUserId(tg?.initDataUnsafe?.user?.id ?? null);
  }, []);

  return (
    <div className="tabs">
      <button
        className={value === "shop" ? "tab active" : "tab"}
        onClick={() => onChange("shop")}
      >
        Магазин
      </button>
      {ADMIN_IDS.include(userId) &&
      <button
          className={value === "admin" ? "tab active" : "tab"}
          onClick={() => onChange("admin")}
        >
          Админ
      </button>}
    </div>
  );
}