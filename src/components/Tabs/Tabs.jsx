import React, { useEffect, useMemo, useState } from "react";
import "./Tabs.css";

function getAdminIds() {
  // Поддержка Vite, CRA и Next.js (а также fallback на ADMIN_IDS)
  const raw =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_ADMIN_IDS) ||
    (typeof process !== "undefined" && process.env && (
      process.env.REACT_APP_ADMIN_IDS ||
      process.env.NEXT_PUBLIC_ADMIN_IDS ||
      process.env.ADMIN_IDS
    )) ||
    "";

  return raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => Number(s))
    .filter(n => Number.isFinite(n));
}

export default function Tabs({ value, onChange }) {
  const ADMIN_IDS = useMemo(getAdminIds, []);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    console.log("Telegram user:", tg?.initDataUnsafe?.user);
    setUserId(tg?.initDataUnsafe?.user?.id ?? null);
  }, []);

  // Для отладки — проверьте, что здесь не пусто
  useEffect(() => {
    console.log("ADMIN_IDS:", ADMIN_IDS, "userId:", userId, "types:", typeof ADMIN_IDS[0], typeof userId);
  }, [ADMIN_IDS, userId]);

  const isAdmin = userId != null && ADMIN_IDS.includes(Number(userId));

  return (
    <div className="tabs">
      <button
        className={value === "shop" ? "tab active" : "tab"}
        onClick={() => onChange("shop")}
      >
        Магазин
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