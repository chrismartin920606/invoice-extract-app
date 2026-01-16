'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

export default function InvoiceEditModal({ invoice, onClose, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/invoices/${invoice.id}`);
        const data = await response.json();
        setInvoiceDetails(data);
        setFormData({
          invoice_number: data.invoice_number,
          customer_name: data.customer_name,
          invoice_date: data.invoice_date,
          due_date: data.due_date,
          total_amount: data.total_amount,
          tax_amount: data.tax_amount,
          subtotal: data.subtotal,
          items: data.items,
        });
      } catch (error) {
        console.error('Error fetching invoice details:', error);
      }
    };

    fetchDetails();
  }, [invoice.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const addNewItem = () => {
    const newItems = [...(formData.items || [])];
    newItems.push({
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    });
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!invoiceDetails) {
    return (
      <div className="fixed inset-0 bg-gray-500/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="text-center text-gray-600 mt-4">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Invoice</h3>
                <p className="text-gray-600">
                  #{invoice.invoice_number || 'No number'} • {invoice.filename}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200/60">
          <div className="px-8 flex space-x-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Invoice Details</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 px-1 font-medium border-b-2 transition-colors ${
                activeTab === 'items'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ShoppingCartIcon className="h-5 w-5" />
                <span>Items ({formData.items?.length || 0})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 font-medium border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CalculatorIcon className="h-5 w-5" />
                <span>Summary</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8">
            {activeTab === 'details' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Invoice Info Card */}
                  <div className="card p-6">
                    <h4 className="font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                      <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                      <span>Invoice Information</span>
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Invoice Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.invoice_number || ''}
                          onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                          className="input-field"
                          placeholder="INV-2024-001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.customer_name || ''}
                          onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                          className="input-field"
                          placeholder="Enter customer name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dates Card */}
                  <div className="card p-6">
                    <h4 className="font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5 text-blue-500" />
                      <span>Dates</span>
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Invoice Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.invoice_date || ''}
                          onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={formData.due_date || ''}
                          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Invoice Items</h4>
                  <button
                    type="button"
                    onClick={addNewItem}
                    className="btn-secondary"
                  >
                    Add New Item
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items?.map((item, index) => (
                    <div key={index} className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-gray-900">Item #{index + 1}</h5>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                          </label>
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="input-field"
                            placeholder="Product or service name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                              className="input-field pl-8"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total
                          </label>
                          <div className="input-field bg-gray-50 font-semibold text-gray-900">
                            {formatCurrency(item.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Amounts Card */}
                  <div className="card p-6 md:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
                      <span>Amounts</span>
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subtotal
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.subtotal || ''}
                            onChange={(e) => setFormData({...formData, subtotal: parseFloat(e.target.value)})}
                            className="input-field pl-8"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.tax_amount || ''}
                            onChange={(e) => setFormData({...formData, tax_amount: parseFloat(e.target.value)})}
                            className="input-field pl-8"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Amount *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={formData.total_amount || ''}
                            onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})}
                            className="input-field pl-8 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="card p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Quick Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium">{formData.items?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(formData.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">{formatCurrency(formData.tax_amount)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-blue-600">{formatCurrency(formData.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200/60 px-8 py-6 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Last updated: {new Date(invoiceDetails.updated_at || invoiceDetails.created_at).toLocaleString()}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}