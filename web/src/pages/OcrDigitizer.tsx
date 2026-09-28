import React, { useState } from 'react';
import api from '../services/api';
import { FileText, Upload, Sparkles, CheckCircle2, Clock, FileCheck } from 'lucide-react';

export const OcrDigitizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('PERMIT');
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    try {
      const res = await api.post('/ocr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setOcrResult(res.data);
    } catch (err) {
      console.error('OCR Upload failed:', err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-amber-500" />
            <span>Document OCR & Statutory Digitization Engine</span>
          </h1>
          <p className="text-xs text-slate-400">Automated Tesseract document parsing, field extraction, and digital archiving for scanned permits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-lg">
          <div className="text-sm font-bold text-white">Upload Scanned Document / Permit</div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none font-semibold"
            >
              <option value="PERMIT">DGMS Statutory Safety Permit</option>
              <option value="ENVIRONMENTAL_CLEARANCE">Environmental Clearance (CPCB / MoEFCC)</option>
              <option value="CONTRACTOR_LICENSE">Contractor License & Labour Registration</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select File (Image / Scanned PDF)</label>
            <div className="bg-slate-950 border border-dashed border-slate-700 p-6 rounded-xl text-center cursor-pointer hover:border-amber-500 transition">
              <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/10"
          >
            <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Extracting OCR Metadata...' : 'Process & Extract Structured Fields'}</span>
          </button>
        </form>

        {/* OCR Result View */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              <span>Extracted Structured Data</span>
            </h2>
            {ocrResult && (
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                Status: {ocrResult.status}
              </span>
            )}
          </div>

          {ocrResult ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Permit Reference No:</span>
                    <span className="font-mono text-amber-400 font-bold">{ocrResult.extracted_metadata?.permit_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Valid Until Expiry:</span>
                    <span className="font-mono text-white font-bold">{ocrResult.expiry_date}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Issuing Authority:</span>
                  <span className="text-slate-200 font-medium">{ocrResult.extracted_metadata?.issuing_authority}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 font-semibold">Parsed Statutory Conditions:</div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 bg-slate-950 p-3 rounded border border-slate-800">
                  {ocrResult.extracted_metadata?.compliance_conditions?.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 font-semibold">Full OCR Extracted Text:</div>
                <textarea
                  readOnly
                  rows={4}
                  value={ocrResult.ocr_text}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded font-mono text-[11px]"
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-16 text-center space-y-2">
              <FileText className="h-10 w-10 text-slate-700 mx-auto" />
              <div>Upload a scanned permit on the left to extract metadata</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
