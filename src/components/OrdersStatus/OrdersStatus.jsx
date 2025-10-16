//import React, { useEffect, useRef, useState } from "react";
import "/Dialog/Dialog.css";
import {useEffect, useRef} from "react";
//import {useTelegram} from "../../telegram/useTelegram";

export default function OrdersStatus({ onClose, isOpen, order}) {

  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (isOpen && !node.open) {
      try { node.showModal(); } catch {}
    } else if (!isOpen && node.open) {
      node.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={ref} className="dialog" aria-labelledby="checkout-title">
      <button className="dialog__close" aria-label="Закрыть" onClick={onClose}>×</button>
      <div className="dialog__body">
        <h2 id="checkout-title" className="dialog__title">Статус заказа</h2>
          <div className="dialog__meta">
            {order?.category_name && <span className="dialog__service">{order?.category_name}</span>}
            {order && <span className="dialog__dash"> — </span>}
            {order?.product_name && <span className="dialog__product">{order?.product_name}</span>}
          </div>
      </div>
    </dialog>
  );
}