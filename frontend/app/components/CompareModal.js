'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  PrinterIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function CompareModal({ invoiceId1, invoiceId2, onClose }) {
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);
  const [invoice1, setInvoice1] = useState(null);
  const [invoice2, setInvoice2] = useState(null);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('overview'); // overview, details, items

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        
        // Fetch individual invoice details
        const [invoice1Res, invoice2Res] = await Promise.all([
          fetch(`http://localhost:5000/api/invoices/${invoiceId1}`),
          fetch(`http://localhost:5000/api/invoices/${invoiceId2}`)
        ]);
        
        if (!invoice1Res.ok || !invoice2Res.ok) {
          throw new Error('Failed to fetch invoice details');
        }
        
        const invoice1Data = await invoice1Res.json();
        const invoice2Data = await invoice2Res.json();
        
        setInvoice1(invoice1Data);
        setInvoice2(invoice2Data);
        
        // Fetch comparison data
        const compareRes = await fetch(
          `http://localhost:5000/api/compare/${invoiceId1}/${invoiceId2}`
        );
        
        if (compareRes.ok) {
          const compareData = await compareRes.json();
          setComparisonData(compareData);
        }
        
      } catch (err) {
        console.error('Error fetching comparison:', err);
        setError('Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComparison();
  }, [invoiceId1, invoiceId2]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
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

  const calculateDifference = (val1, val2) => {
    if (val1 === null || val2 === null || val1 === val2) return 0;
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      return val2 - val1;
    }
    return null;
  };

  const renderComparisonCard = (field, label, isCurrency = false) => {
    const diff = comparisonData?.differences?.[field];
    const isDifferent = !!diff;
    
    const val1 = invoice1?.[field];
    const val2 = invoice2?.[field];
    const difference = calculateDifference(val1, val2);

    return (
      <div className={`card p-5 transition-all duration-300 ${isDifferent ? 'border-l-4 border-l-red-500' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">{label}</h4>
          {isDifferent ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Different
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <CheckIcon className="h-3 w-3 mr-1" />
              Match
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${isDifferent ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">Invoice 1</span>
              {difference !== null && difference > 0 && (
                <ArrowTrendingUpIcon className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className={`text-sm font-semibold ${isDifferent ? 'text-red-700' : 'text-gray-900'}`}>
              {isCurrency ? formatCurrency(val1) : val1 || 'N/A'}
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${isDifferent ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">Invoice 2</span>
              {difference !== null && difference < 0 && (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className={`text-sm font-semibold ${isDifferent ? 'text-red-700' : 'text-gray-900'}`}>
              {isCurrency ? formatCurrency(val2) : val2 || 'N/A'}
            </p>
          </div>
        </div>
        
        {isDifferent && difference !== null && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Difference:</span>
              <span className={`font-semibold ${difference > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {difference > 0 ? '+' : ''}{isCurrency ? formatCurrency(difference) : difference}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderItemsComparison = () => {
    const items1 = invoice1?.items || [];
    const items2 = invoice2?.items || [];
    const itemsDiff = comparisonData?.differences?.items;
    const isDifferent = items1.length !== items2.length || itemsDiff;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Items Comparison</h3>
          <div className="flex items-center space-x-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
              {items1.length} items
            </span>
            <span className="text-gray-400">vs</span>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
              {items2.length} items
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice 1 Items */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100/30">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                  {invoice1?.filename || 'Invoice 1'}
                </h4>
                <span className="text-sm text-gray-600">{items1.length} items</span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {items1.length > 0 ? (
                items1.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.description || 'Unnamed Item'}</p>
                        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(item.unit_price)}</p>
                        <p className="text-sm text-gray-600">each</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="font-bold text-blue-600">{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No items found</p>
                </div>
              )}
            </div>
            {items1.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Value</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(items1.reduce((sum, item) => sum + (item.total || 0), 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Invoice 2 Items */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100/30">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                  {invoice2?.filename || 'Invoice 2'}
                </h4>
                <span className="text-sm text-gray-600">{items2.length} items</span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {items2.length > 0 ? (
                items2.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.description || 'Unnamed Item'}</p>
                        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(item.unit_price)}</p>
                        <p className="text-sm text-gray-600">each</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="font-bold text-purple-600">{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No items found</p>
                </div>
              )}
            </div>
            {items2.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Value</span>
                  <span className="text-xl font-bold text-purple-600">
                    {formatCurrency(items2.reduce((sum, item) => sum + (item.total || 0), 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Differences Summary */}
        {isDifferent && (
          <div className="card p-6 bg-gradient-to-r from-red-50 to-red-100/30 border border-red-200">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-3">Items Differences Detected</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <p className="text-xs text-gray-600 mb-1">Total Items</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-bold text-red-700">{items1.length}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-lg font-bold text-red-700">{items2.length}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <p className="text-xs text-gray-600 mb-1">Total Quantity</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-bold text-red-700">
                        {items1.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                      </span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-lg font-bold text-red-700">
                        {items2.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <p className="text-xs text-gray-600 mb-1">Item Value</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-bold text-red-700">
                        {formatCurrency(itemsDiff?.invoice1_total_value || items1.reduce((sum, item) => sum + (item.total || 0), 0))}
                      </span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-lg font-bold text-red-700">
                        {formatCurrency(itemsDiff?.invoice2_total_value || items2.reduce((sum, item) => sum + (item.total || 0), 0))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                      <span className="font-semibold text-red-700">Mismatch</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => {
    const differencesCount = Object.keys(comparisonData?.differences || {}).length;
    const items1 = invoice1?.items || [];
    const items2 = invoice2?.items || [];

    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="card p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Comparison Summary</h3>
              <p className="text-gray-600 mt-1">AI analysis of invoice differences</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Differences Found</p>
              <p className={`text-2xl font-bold ${differencesCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {differencesCount}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Total Items</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-bold text-blue-600">{items1.length}</span>
                <span className="text-gray-400">/</span>
                <span className="text-lg font-bold text-purple-600">{items2.length}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Total Amount</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-sm font-bold text-blue-600">{formatCurrency(invoice1?.total_amount)}</span>
                <span className="text-gray-400">/</span>
                <span className="text-sm font-bold text-purple-600">{formatCurrency(invoice2?.total_amount)}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Match Status</p>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${differencesCount === 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className={`font-semibold ${differencesCount === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {differencesCount === 0 ? 'Perfect Match' : 'Differences Found'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Fields Comparison */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Fields Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderComparisonCard('invoice_number', 'Invoice Number')}
            {renderComparisonCard('customer_name', 'Customer Name')}
            {renderComparisonCard('invoice_date', 'Invoice Date')}
            {renderComparisonCard('total_amount', 'Total Amount', true)}
            {renderComparisonCard('tax_amount', 'Tax Amount', true)}
            {renderComparisonCard('subtotal', 'Subtotal', true)}
          </div>
        </div>

        {/* Actionable Insights */}
        {differencesCount > 0 && (
          <div className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-200">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Action Required</h4>
                <ul className="space-y-2 text-sm text-amber-700">
                  {comparisonData?.differences?.invoice_number && (
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                      <span>Invoice numbers don't match</span>
                    </li>
                  )}
                  {comparisonData?.differences?.customer_name && (
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                      <span>Different customers identified</span>
                    </li>
                  )}
                  {comparisonData?.differences?.total_amount && (
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                      <span>Total amounts differ significantly</span>
                    </li>
                  )}
                  {comparisonData?.differences?.items && (
                    <li className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                      <span>Items list varies between invoices</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="spinner h-16 w-16 border-4"></div>
              <SparklesIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Invoices</h3>
            <p className="text-gray-600 text-center">AI is comparing invoice data and identifying differences...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-500/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparison Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              Close
            </button>
          </div>
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
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-20"></div>
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Invoice Comparison</h3>
                <p className="text-gray-600">
                  {invoice1?.filename} vs {invoice2?.filename}
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
              onClick={() => setActiveView('overview')}
              className={`py-4 px-1 font-medium border-b-2 transition-colors ${
                activeView === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('details')}
              className={`py-4 px-1 font-medium border-b-2 transition-colors ${
                activeView === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Details</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('items')}
              className={`py-4 px-1 font-medium border-b-2 transition-colors ${
                activeView === 'items'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ShoppingCartIcon className="h-5 w-5" />
                <span>Items</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'details' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Field Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderComparisonCard('invoice_number', 'Invoice Number')}
                {renderComparisonCard('customer_name', 'Customer Name')}
                {renderComparisonCard('invoice_date', 'Invoice Date')}
                {renderComparisonCard('due_date', 'Due Date')}
                {renderComparisonCard('subtotal', 'Subtotal', true)}
                {renderComparisonCard('tax_amount', 'Tax Amount', true)}
                {renderComparisonCard('total_amount', 'Total Amount', true)}
              </div>
            </div>
          )}
          {activeView === 'items' && renderItemsComparison()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200/60 px-8 py-6 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span>Match</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span>Difference</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.print()}
                className="btn-secondary"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}