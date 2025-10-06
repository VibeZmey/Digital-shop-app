import React from "react";
import "./Header.css";

export default function Header() {
  return (
    <header className="app-header">
      <img src="/icons/logo.png" alt="logo" />
      <div className="brand">
        <div className="brand-title">DigitalShop</div>
        <div className="brand-sub">цифровые подписки</div>
      </div>
    </header>
  );
}