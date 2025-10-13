import React from "react";
import "./OrderCard.css";

export default function OrderCard ({ name, price, image, onClick, status }) {
  return (
    <div className="order-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="order-card__left">
        <img className="order-card__image" src={image} alt={name} />
        <div className="order-card__meta">
          <div className="order-card__name">{name}</div>
          {price!==0 ? <div className="order-card__price">{price} ₽</div> : null}
        </div>
      </div>
      <div className="order-card__cta">{status === "inProcess" && "в процессе" || status}</div>
    </div>
  );
}