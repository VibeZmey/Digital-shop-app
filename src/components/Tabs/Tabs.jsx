import React, { useEffect, useMemo, useState } from "react";
import "./Tabs.css";

function getAdminIds() {

  const raw =
    (typeof process !== "undefined" && process.env && process.env.ADMIN_IDS) ||
    "";

  return raw
    .split(",")
    .map(s => parseInt(s.trim(), 10))
    .filter(n => Number.isFinite(n));
}

export default function Tabs({ value, onChange }) {
  const ADMIN_IDS = useMemo(getAdminIds, []);
  const [userId, setUserId] = useState(null);

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