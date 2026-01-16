'use client';

import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import InvoiceTable from './components/InvoiceTable';
import CompareModal from './components/CompareModal';
import { 
  SparklesIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    processed: 0,
    averageAmount: 0
  });

  const fetchInvoices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/invoices');
      const data = await response.json();
      setInvoices(data);
      
      const totalAmount = data.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const processed = data.filter(inv => inv.status === 'processed').length;
      
      setStats({
        total: data.length,
        totalAmount,
        processed,
        averageAmount: data.length > 0 ? totalAmount / data.length : 0
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleUploadSuccess = () => {
    fetchInvoices();
  };

  const handleInvoiceSelect = (invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else if (prev.length < 2) {
        return [...prev, invoiceId];
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <SparklesIcon className="h-6 w-6 text-white flex-shrink-0" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Invoice AI</h1>
                <p className="text-xs text-slate-500">Professional Document Processing</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setCurrentPage('dashboard');
                  setSelectedInvoices([]);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                  currentPage === 'dashboard'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('invoices')}
                className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                  currentPage === 'invoices'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setCurrentPage('upload')}
                className={`px-4 py-2 rounded-md font-medium transition-all text-sm flex items-center space-x-1 ${
                  currentPage === 'upload'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusIcon className="h-4 w-4 flex-shrink-0" />
                <span>Upload</span>
              </button>
            </nav>

            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-slate-600 mt-2">Here's your invoice processing overview</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Invoices */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Total Invoices</p>
                    <p className="text-4xl font-bold text-slate-900 mt-3">{stats.total}</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-3">↑ {stats.processed} processed</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Total Value</p>
                    <p className="text-4xl font-bold text-slate-900 mt-3">
                      ${(stats.totalAmount / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-slate-500 mt-3">
                      Avg: ${stats.averageAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* Processing Status */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Processing</p>
                    <p className="text-4xl font-bold text-slate-900 mt-3">
                      {invoices.length > 0 ? Math.round((stats.processed / invoices.length) * 100) : 0}%
                    </p>
                    <div className="w-full bg-slate-200 rounded-full h-1 mt-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1 rounded-full" 
                        style={{ width: `${invoices.length > 0 ? (stats.processed / invoices.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* Compare Ready */}
              <div className={`rounded-xl border p-6 transition-all ${
                selectedInvoices.length === 2
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-md'
                  : 'bg-white border-slate-200 hover:shadow-md'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Ready to Compare</p>
                    <p className="text-4xl font-bold text-slate-900 mt-3">{selectedInvoices.length}</p>
                    <p className="text-xs text-slate-500 mt-3">Select 2 invoices</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Compare Section */}
            {selectedInvoices.length === 2 && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold">Ready to Compare</h3>
                    <p className="text-blue-100 mt-2">You have selected 2 invoices for comparison analysis</p>
                  </div>
                  <button
                    onClick={() => setShowCompare(true)}
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center space-x-2 flex-shrink-0"
                  >
                    <DocumentTextIcon className="h-5 w-5 flex-shrink-0" />
                    <span>Compare Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                {invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.slice(0, 3).map((inv, idx) => (
                      <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="h-4 w-4 text-slate-600 flex-shrink-0" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{inv.invoice_number || 'N/A'}</p>
                            <p className="text-xs text-slate-500">{inv.customer_name || 'No customer'}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          ${inv.total_amount?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">No invoices yet</p>
                )}
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Getting Started</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Go to Upload tab to add new invoices</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>AI extracts data automatically from PDF & DOCX</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Select 2 invoices to compare and analyze</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Edit any invoice details as needed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Upload Page */}
        {currentPage === 'upload' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Upload Invoice</h2>
              <p className="text-slate-600 mt-2">Add new invoices for AI processing</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <FileUpload onSuccess={handleUploadSuccess} />
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3 flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                </div>
                <h4 className="font-semibold text-slate-900">Supported Formats</h4>
                <p className="text-sm text-slate-600 mt-2">PDF and DOCX files up to 16MB</p>
              </div>

              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3 flex-shrink-0">
                  <SparklesIcon className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                </div>
                <h4 className="font-semibold text-slate-900">AI Processing</h4>
                <p className="text-sm text-slate-600 mt-2">Automatic data extraction and validation</p>
              </div>

              <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3 flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
                </div>
                <h4 className="font-semibold text-slate-900">Instant Results</h4>
                <p className="text-sm text-slate-600 mt-2">See extracted data immediately</p>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Page */}
        {currentPage === 'invoices' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">All Invoices</h2>
                <p className="text-slate-600 mt-2">View and manage your invoices</p>
              </div>
              <button
                onClick={fetchInvoices}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
              >
                Refresh
              </button>
            </div>

            {/* Selection Banner */}
            {selectedInvoices.length > 0 && (
              <div className="bg-blue-50 border border-blue-300 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-900 font-medium">{selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected</span>
                </div>
                {selectedInvoices.length === 2 && (
                  <button
                    onClick={() => setShowCompare(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-sm flex items-center space-x-2"
                  >
                    <SparklesIcon className="h-4 w-4 flex-shrink-0" />
                    <span>Compare</span>
                  </button>
                )}
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="spinner h-8 w-8 mb-4"></div>
                  <p className="text-slate-600 font-medium">Loading invoices...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <DocumentTextIcon className="h-16 w-16 text-slate-300 mb-4 flex-shrink-0" />
                  <p className="text-slate-600 font-medium mb-1">No invoices yet</p>
                  <p className="text-slate-500 text-sm">Upload your first invoice to get started</p>
                </div>
              ) : (
                <InvoiceTable 
                  invoices={invoices} 
                  onRefresh={fetchInvoices}
                  onSelect={handleInvoiceSelect}
                  selected={selectedInvoices}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Compare Modal */}
      {showCompare && selectedInvoices.length === 2 && (
        <CompareModal
          invoiceId1={selectedInvoices[0]}
          invoiceId2={selectedInvoices[1]}
          onClose={() => {
            setShowCompare(false);
            setSelectedInvoices([]);
          }}
        />
      )}
    </div>
  );
}