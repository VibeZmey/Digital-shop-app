import React from "react";
import "./Tabs.css";

export default function Tabs({ value, onChange }) {
  return (
    <div className="tabs">
      <button
        className={value === "shop" ? "tab active" : "tab"}
        onClick={() => onChange("shop")}
      >
        Магазин
      </button>
      <button
        className={value === "admin" ? "tab active" : "tab"}
        onClick={() => onChange("admin")}
      >
        Админ
      </button>
    </div>
  );
}