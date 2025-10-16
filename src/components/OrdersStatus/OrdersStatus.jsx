import React, { useEffect, useRef } from "react";
import "./OrdersStatus.css";

export default function OrdersStatus({ onClose, isOpen, order }) {
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

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const statusLabels = {
    inProcess: "В процессе",
    completed: "Выполнен",
    failed: "Ошибка",
    pending: "Ожидает",
  };

  const statusKey = order?.status ?? "pending";
  const statusLabel = statusLabels[statusKey] ?? statusKey;

  return (
    <dialog ref={ref} className="dialog" aria-labelledby="order-status-title">
      <button className="dialog__close" aria-label="Закрыть" onClick={onClose}>×</button>
      <div className="dialog__body">
        <h2 id="order-status-title" className="dialog__title">Статус заказа</h2>

        <div className="dialog__meta">
          {order?.name && <span className="dialog__service">{order?.name}</span>}
          {order?.name && order?.price && <span className="dialog__dash"> — </span>}
          {order?.price && <span className="dialog__product">{order?.price} ₽</span>}
        </div>

        <div className="dialog__content">
          <div className="dialog__media">
            {order?.image_path ? (
              // изображение (если путь относительный, убедитесь, что сервер отдаёт статические файлы)
              <img className="dialog__image" src={order.image_path} alt={order.name ?? "Order image"} />
            ) : (
              <div className="dialog__image dialog__image--placeholder" aria-hidden />
            )}

            <div className="dialog__details">
              <div className={`dialog__status status--${statusKey}`}>
                <span className="dialog__status-dot" aria-hidden />
                <span className="dialog__status-label">{statusLabel}</span>
              </div>

              <div className="dialog__times">
                <div className="dialog__time-row">
                  <span className="dialog__time-label">Открыт:</span>
                  <time className="dialog__time" dateTime={order?.order_opened}>
                    {formatDate(order?.order_opened)}
                  </time>
                </div>
                {order?.order_closed && (
                  <div className="dialog__time-row">
                    <span className="dialog__time-label">Закрыт:</span>
                    <time className="dialog__time" dateTime={order?.order_closed}>
                      {formatDate(order?.order_closed)}
                    </time>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Здесь можно добавить дополнительные поля, например: ID заказа, комментарий, кнопки */}
        </div>
      </div>
    </dialog>
  );
}