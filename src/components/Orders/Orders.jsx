//import React, { useState } from "react";
import "./Orders.css";
import OrderCard from "../OrderCard/OrderCard.jsx";

export default function Orders() {

  return (
    <div className="orders">
      <OrderCard name="testOrder" price={10000} image="/icons/placeholder.png" status="в обаботке" onClick={()=>{}} />
    </div>
    );
}