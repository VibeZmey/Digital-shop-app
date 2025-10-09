import React from "react";
import "./ProductCard.css";

export default function ProductCard({ name, price, image, onClick }) {
  return (
    <div className="product-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="product-card__left">
        <img className="product-card__image" src={image} alt={name} />
        <div className="product-card__meta">
          <div className="product-card__name">{name}</div>
          {price!==0 ? <div className="product-card__price">{price} ₽</div> : null}
        </div>
      </div>
      <div className="product-card__cta">Купить</div>
    </div>
  );
}