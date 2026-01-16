'use client';

import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import InvoiceEditModal from './InvoiceEditModal';

export default function InvoiceTable({ invoices, onRefresh, onSelect, selected }) {
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    setDeletingId(id);
    try {
      await fetch(`http://localhost:5000/api/invoices/${id}`, {
        method: 'DELETE',
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
  };

  const handleUpdateSuccess = () => {
    setEditingInvoice(null);
    onRefresh();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/60">
            <thead>
              <tr>
                <th className="table-header w-12">
                  <div className="flex items-center justify-center">
                    <span className="text-gray-400">Select</span>
                  </div>
                </th>
                <th className="table-header">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>Invoice</span>
                  </div>
                </th>
                <th className="table-header">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>Customer</span>
                  </div>
                </th>
                <th className="table-header">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>Date</span>
                  </div>
                </th>
                <th className="table-header">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>Amount</span>
                  </div>
                </th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60">
              {invoices.map((invoice) => (
                <tr 
                  key={invoice.id}
                  className={`transition-all duration-200 ${
                    hoveredRow === invoice.id 
                      ? 'bg-gradient-to-r from-gray-50/50 to-gray-100/30' 
                      : 'hover:bg-gray-50/30'
                  } ${selected.includes(invoice.id) ? 'bg-blue-50/30' : ''}`}
                  onMouseEnter={() => setHoveredRow(invoice.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(invoice.id)}
                        onChange={() => onSelect(invoice.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </td>

                  {/* Invoice Number */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        selected.includes(invoice.id)
                          ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}>
                        <DocumentTextIcon className={`h-5 w-5 flex-shrink-0 ${
                          selected.includes(invoice.id) ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {invoice.invoice_number || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[150px]">
                          {invoice.filename}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Customer Name */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {invoice.customer_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.customer_name ? 'Customer' : 'Not specified'}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.invoice_date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Added: {new Date(invoice.created_at).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(invoice.total_amount)}
                    </div>
                    {invoice.total_amount && (
                      <div className="text-xs text-gray-500">
                        {invoice.tax_amount ? `Tax: ${formatCurrency(invoice.tax_amount)}` : 'No tax'}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`status-badge ${
                        invoice.status === 'processed' ? 'status-processed' :
                        invoice.status === 'updated' ? 'status-pending' :
                        'status-error'
                      }`}>
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            invoice.status === 'processed' ? 'bg-emerald-400' :
                            invoice.status === 'updated' ? 'bg-amber-400' :
                            'bg-red-400'
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            invoice.status === 'processed' ? 'bg-emerald-500' :
                            invoice.status === 'updated' ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}></span>
                        </span>
                        {invoice.status}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group flex-shrink-0"
                        title="Edit invoice"
                      >
                        <PencilIcon className="h-4 w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      </button>
                      
                      <button
                        onClick={() => window.open(`http://localhost:5000/api/invoices/${invoice.id}`, '_blank')}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 group flex-shrink-0"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deletingId === invoice.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="Delete invoice"
                      >
                        {deletingId === invoice.id ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin flex-shrink-0" />
                        ) : (
                          <TrashIcon className="h-4 w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {invoices.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 flex-shrink-0" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Upload your first invoice to start extracting data with AI. We support PDF and DOCX formats.
            </p>
            <div className="text-sm text-gray-500">
              The table will populate automatically after your first upload
            </div>
          </div>
        )}

        {/* Summary Footer */}
        {invoices.length > 0 && (
          <div className="border-t border-gray-200/60 px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{invoices.length}</span> invoices
                {selected.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {selected.length} selected for comparison
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span>Processed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span>Updated</span>
                </div>
                <button
                  onClick={onRefresh}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                  <ArrowPathIcon className="h-4 w-4 flex-shrink-0" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingInvoice && (
        <InvoiceEditModal
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}