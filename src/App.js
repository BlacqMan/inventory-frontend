import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductList from "./components/ProductList";

function App() {
  return (
    <div>
      <ProductList />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
