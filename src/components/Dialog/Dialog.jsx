import React, { useEffect, useRef, useState } from "react";
import "./Dialog.css";
import {useTelegram} from "../../telegram/useTelegram";

export default function Dialog({ isOpen, onClose, service, product, requiresPassword }) {
  const { MainButton } = useTelegram();

  const ref = useRef(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    MainButton.setParams({
      text: 'Оплатить'
    })
  }, [MainButton]);

  useEffect(() => {
    if(!login || (requiresPassword && !password) || !isOpen) {
      MainButton.hide();
    }else{
      MainButton.show();
    }
  }, [MainButton, login, password, isOpen, requiresPassword]);

  // reset on open
  useEffect(() => {
    if (isOpen) {
      setLogin("");
      setPassword("");
    }
  }, [isOpen]);

  // sync native dialog
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (isOpen && !node.open) {
      try { node.showModal(); } catch {}
    } else if (!isOpen && node.open) {
      node.close();
    }
  }, [isOpen]);

  // close events
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onCancel = (e) => { e.preventDefault(); onClose?.(); };
    const onCloseEv = () => onClose?.();
    node.addEventListener("cancel", onCancel);
    node.addEventListener("close", onCloseEv);
    return () => {
      node.removeEventListener("cancel", onCancel);
      node.removeEventListener("close", onCloseEv);
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь позже подключите реальную оплату
    console.log("Checkout:", { service, product, login, password: password && null });
  };

  return (
    <dialog ref={ref} className="dialog" aria-labelledby="checkout-title">
      <button className="dialog__close" aria-label="Закрыть" onClick={onClose}>×</button>
      <div className="dialog__body">
        <h2 id="checkout-title" className="dialog__title">Оформление заказа</h2>
        {(service || product) && (
          <div className="dialog__meta">
            {service && <span className="dialog__service">{service}</span>}
            {service && product && <span className="dialog__dash"> — </span>}
            {product && <span className="dialog__product">{product}</span>}
          </div>
        )}
        <form className="dialog__form" onSubmit={handleSubmit}>
          <label className="dialog__field">
            <span className="dialog__label">Логин</span>
            <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Введите логин" required />
          </label>
          {requiresPassword ? (
            <label className="dialog__field">
              <span className="dialog__label">Пароль</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" required />
            </label>
          ) : null}

        </form>
      </div>
    </dialog>
  );
}