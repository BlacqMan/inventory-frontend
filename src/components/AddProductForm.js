import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddProductForm = ({ onProductAdded, productToEdit, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description,
        price: productToEdit.price,
        quantity: productToEdit.quantity,
        category: productToEdit.category
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: ""
      });
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (productToEdit) {
        // Edit product
        res = await axios.put(
          `http://localhost:5000/api/products/${productToEdit._id}`,
          {
            ...formData,
            price: Number(formData.price),
            quantity: Number(formData.quantity)
          }
        );
        onProductUpdated(res.data);
        toast.success("Product updated successfully!");
      } else {
        // Add product
        res = await axios.post("http://localhost:5000/api/products", {
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity)
        });
        onProductAdded(res.data);
        toast.success("Product added successfully!");
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: ""
      });
    } catch (err) {
      console.error("Failed to save product:", err);
      toast.error("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-10">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {productToEdit ? "Edit Product" : "Add New Product"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="px-4 py-2 border rounded-lg md:col-span-2 focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : productToEdit ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
