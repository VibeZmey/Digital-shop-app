import React, { useState } from "react";
import "./CategoryAccordion.css";

export default function CategoryAccordion({ title, icon, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="category">
      <button className="category__header" onClick={() => setOpen((v) => !v)}>
        <div className="category__left">
          <img className="category__icon" src={icon} alt={title} />
          <span className="category__title">{title}</span>
        </div>
        <span className="category__chevron">{open ? "▴" : "▾"}</span>
      </button>
      {open && <div className="category__content">{children}</div>}
    </div>
  );
}