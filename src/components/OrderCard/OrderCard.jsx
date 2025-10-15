import React from "react";
import "./OrderCard.css";

export default function OrderCard ({ order, onClick }) {
  return (
    <div className="order-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="order-card__left">
        <img className="order-card__image" src={order.image} alt={order.name} />
        <div className="order-card__meta">
          <div className="order-card__name">{order.name}</div>
          {order.price!==0 ? <div className="order-card__price">{order.price} ₽</div> : null}
        </div>
      </div>
      <div className="order-card__cta">{order.status === "inProcess" && "в процессе" || order.status}</div>
    </div>
  );
}