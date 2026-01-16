'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowUpTrayIcon, 
  DocumentIcon, 
  XMarkIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export default function FileUpload({ onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await uploadFile(acceptedFiles[0]);
      }
    }
  });

  const uploadFile = async (file) => {
    setUploading(true);
    setMessage('');
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();
      
      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Invoice processed successfully! AI has extracted all data.'
        });
        if (onSuccess) onSuccess();
        
        // Reset after 3 seconds
        setTimeout(() => {
          setMessage('');
          setUploadProgress(0);
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: `Error: ${data.error}`
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 1000);
    }
  };

  const removeFile = () => {
    // Clear the accepted files
    acceptedFiles.length = 0;
    setMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50/50 to-purple-50/50 scale-[1.02]' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
          }`}
      >
        <input {...getInputProps()} />
        <div className="p-10 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
              <ArrowUpTrayIcon className="h-10 w-10 text-white flex-shrink-0" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Drop your invoice here' : 'Drag & drop your invoice'}
          </h3>
          <p className="text-gray-600 mb-4">
            Upload PDF or DOCX files. AI will automatically extract invoice data.
          </p>
          
          <button 
            type="button" 
            className="btn-primary"
            onClick={(e) => e.stopPropagation()}
          >
            Browse Files
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Supported formats: PDF, DOCX • Max size: 16MB
          </p>
        </div>
      </div>

      {/* File Preview */}
      {acceptedFiles.length > 0 && !uploading && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <DocumentIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{acceptedFiles[0].name}</p>
                <p className="text-sm text-gray-500">
                  {(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <XMarkIcon className="h-5 w-5 flex-shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="card p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Processing Invoice</h4>
                <p className="text-sm text-gray-600 mt-1">AI is extracting data from your document</p>
              </div>
              <span className="text-sm font-semibold text-blue-600">{uploadProgress}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>Uploading</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`h-2 w-2 rounded-full ${uploadProgress > 33 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <span>OCR Processing</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`h-2 w-2 rounded-full ${uploadProgress > 66 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <span>AI Extraction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className={`rounded-2xl p-4 border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <XMarkIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
              )}
            </div>
            <div>
              <p className={`font-medium ${
                message.type === 'success' ? 'text-emerald-800' : 'text-red-800'
              }`}>
                {message.type === 'success' ? 'Success!' : 'Error'}
              </p>
              <p className={`text-sm mt-1 ${
                message.type === 'success' ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-blue-100/30 border border-blue-200/30">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">AI-Powered</p>
              <p className="text-sm text-gray-600">Smart data extraction</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-purple-100/30 border border-purple-200/30">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Fast Processing</p>
              <p className="text-sm text-gray-600">Real-time results</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border border-emerald-200/30">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Multi-Format</p>
              <p className="text-sm text-gray-600">PDF & DOCX support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}