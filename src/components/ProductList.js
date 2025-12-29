import React, { useEffect, useState } from "react";
import axios from "axios";
import AddProductForm from "./AddProductForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [productToEdit, setProductToEdit] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://inventory-backend-by75.onrender.com/api/products")

        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        toast.error("Failed to fetch products");
      }
    };
    fetchProducts();
  }, []);

  // Add product
  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    toast.success("Product added successfully!");
  };

  // Update product
  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
    setProductToEdit(null);
    toast.success("Product updated successfully!");
  };

  // Edit product
  const handleEdit = (product) => {
    setProductToEdit(product);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setLoadingDelete(id);
      await axios.delete(
  `https://inventory-backend-by75.onrender.com/api/products/${id}`
);

      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete product");
    } finally {
      setLoadingDelete(null);
    }
  };

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Stock status
  const getStockStatus = (qty) => {
    if (qty < 10) return { label: "LOW STOCK", className: "bg-red-500" };
    if (qty <= 30) return { label: "MEDIUM", className: "bg-yellow-400" };
    return { label: "IN STOCK", className: "bg-green-500" };
  };

  // Dashboard metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.quantity < 10).length;
  const totalCategories = new Set(products.map((p) => p.category)).size;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="max-w-7xl mx-auto">

        {/* Add/Edit Product Form */}
        <AddProductForm
          onProductAdded={handleProductAdded}
          productToEdit={productToEdit}
          onProductUpdated={handleProductUpdated}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500">Total Products</p>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500">Low Stock</p>
            <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500">Categories</p>
            <p className="text-2xl font-bold">{totalCategories}</p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const stock = getStockStatus(product.quantity);

            return (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-105 transition relative"
              >
                {/* Stock Badge */}
                <span
                  className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${stock.className}`}
                >
                  {stock.label}
                </span>

                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />

                <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
                <p className="text-gray-600 text-sm">{product.description}</p>
                <p className="mt-2 font-semibold text-indigo-600">${product.price}</p>
                <p className="text-gray-500 text-sm">Qty: {product.quantity}</p>
                <p className="text-xs text-gray-400 mt-1">{product.category}</p>

                {/* Stock level bar */}
                <div className="h-2 w-full rounded-full mt-2 overflow-hidden bg-gray-200">
                  <div
                    className={`h-full ${stock.className}`}
                    style={{ width: `${Math.min((product.quantity / 50) * 100, 100)}%` }}
                  ></div>
                </div>

                {/* Edit/Delete */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    onClick={() => handleEdit(product)}
                    disabled={loadingDelete === product._id}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    onClick={() => handleDelete(product._id)}
                    disabled={loadingDelete === product._id}
                  >
                    {loadingDelete === product._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
