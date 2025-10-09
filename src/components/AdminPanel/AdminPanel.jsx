import React, { useState } from "react";
import "./AdminPanel.css";
import CategoryAccordion from "../CategoryAccordion/CategoryAccordion.jsx";
import ProductCard from "../ProductCard/ProductCard.jsx";

export default function AdminPanel({ data, addCategory, addProduct, removeCategory, removeProduct }) {
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("");

  const [targetCat, setTargetCat] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(true);

  const canAddCat = catName.trim().length > 0;
  const canAddProd = targetCat && prodName.trim().length > 0;

  return (
    <div className="admin">
      <div className="panel">
        <h3>Добавить категорию</h3>
        <div className="row">
          <label>Название</label>
          <input placeholder="Напр. Netflix" value={catName} onChange={(e) => setCatName(e.target.value)} />
        </div>
        <div className="row">
          <label>Иконка (URL)</label>
          <input placeholder="/icons/netflix.png" value={catIcon} onChange={(e) => setCatIcon(e.target.value)} />
        </div>
        <button
          className="btn primary"
          onClick={() => {
            addCategory({ name: catName.trim(), icon: catIcon.trim() || "/icons/placeholder.png" });
            setCatName(""); setCatIcon("");
          }}
          disabled={!canAddCat}
        >
          Добавить категорию
        </button>
      </div>

      <div className="panel">
        <h3>Добавить товар</h3>
        <div className="row">
          <label>Категория</label>
          <select value={targetCat} onChange={(e) => setTargetCat(e.target.value)}>
            <option value="">Выберите категорию</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="row">
          <label>Название</label>
          <input placeholder="Напр. Premium" value={prodName} onChange={(e) => setProdName(e.target.value)} />
        </div>
        <div className="row">
          <label>Цена (₽, опционально)</label>
          <input placeholder="960" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
        </div>
        <div className="row">
          <label>Изображение (URL)</label>
          <input placeholder="/icons/subscription.png" value={prodImage} onChange={(e) => setProdImage(e.target.value)} />
        </div>
        <div className="row row--inline">
          <label>Нужен пароль?</label>
          <input type="checkbox" checked={requiresPassword} onChange={(e) => setRequiresPassword(e.target.checked)} />
        </div>
        <button
          className="btn primary"
          onClick={() => {
            addProduct(targetCat, { name: prodName.trim(), price: Number(prodPrice.trim()) || 0, image: prodImage.trim() || "/icons/placeholder.png", requiresPassword });
            setProdName(""); setProdPrice(""); setProdImage("");
          }}
          disabled={!canAddProd}
        >
          Добавить товар
        </button>
      </div>

      <div className="panel">
        <h3>Категории и товары</h3>
        <div className="admin-list">
          {data.categories.map((cat) => (
            <CategoryAccordion key={cat.id} title={cat.name} icon={cat.icon}>
              <div className="admin-cat-actions">
                <button className="btn ghost" onClick={() => removeCategory(cat.id)}>Удалить категорию</button>
              </div>
              <div className="admin-products">
                {cat.products.length === 0 && <div className="empty">Нет товаров</div>}
                {cat.products.map((p) => (
                  <div className="admin-product-row" key={p.id}>
                    <ProductCard name={p.name} price={p.price} image={p.image} onClick={() => {}} />
                    <button className="btn ghost" onClick={() => removeProduct(cat.id, p.id)}>Удалить</button>
                  </div>
                ))}
              </div>
            </CategoryAccordion>
          ))}
        </div>
      </div>
    </div>
  );
}