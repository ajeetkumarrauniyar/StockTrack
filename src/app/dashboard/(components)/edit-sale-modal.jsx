"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProducts } from "@/store/productsSlice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EditSaleModal({ sale, onClose, onUpdate }) {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const [editedSale, setEditedSale] = useState(sale);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const updatedProducts = [...editedSale.products];
      updatedProducts[index] = { ...updatedProducts[index], [name]: parseFloat(value) || 0 };
      setEditedSale({ ...editedSale, products: updatedProducts });
    } else {
      setEditedSale({ ...editedSale, [name]: value });
    }
  };

  const handleProductChange = (value, index) => {
    const updatedProducts = [...editedSale.products];
    const selectedProduct = products.find(p => p._id === value);
    updatedProducts[index] = { 
      ...updatedProducts[index], 
      product: value,
      rate: selectedProduct.rate,
      mrp: selectedProduct.mrp
    };
    setEditedSale({ ...editedSale, products: updatedProducts });
  };

  const calculateTotals = () => {
    const totalQuantity = editedSale.products.reduce((sum, product) => sum + product.quantity, 0);
    const totalAmount = editedSale.products.reduce((sum, product) => sum + (product.quantity * product.rate), 0);
    return { totalQuantity, totalAmount };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { totalQuantity, totalAmount } = calculateTotals();
    onUpdate({ ...editedSale, totalQuantity, totalAmount });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={editedSale.invoiceNumber}
              onChange={handleInputChange}
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="partyName">Party Name</Label>
            <Input
              id="partyName"
              name="partyName"
              value={editedSale.partyName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={new Date(editedSale.date).toISOString().split('T')[0]}
              onChange={handleInputChange}
            />
          </div>
          {editedSale.products.map((product, index) => (
            <div key={index} className="space-y-2">
              <Select
                value={product.product}
                onValueChange={(value) => handleProductChange(value, index)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                name="quantity"
                type="number"
                value={product.quantity}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Quantity"
              />
              <Input
                name="rate"
                type="number"
                value={product.rate}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Rate"
              />
            </div>
          ))}
          <Button type="submit">Update Sale</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

