'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface CloudinaryUploaderProps {
  onUploaded: (urls: string[]) => void;
  folder?: string;
  label?: string;
  compact?: boolean;
  multiple?: boolean;
}

export default function CloudinaryUploader({
  onUploaded,
  folder = 'UNDANGAN',
  label = 'Upload Foto ke Cloudinary',
  compact = false,
  multiple = false,
}: CloudinaryUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploading(true);

    const uploadedUrls: string[] = [];
    const total = multiple ? files.length : 1;

    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" bukan format gambar yang didukung (PNG, JPG, WebP)`);
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Ukuran file "${file.name}" melebihi batas 10MB`);
        }

        setProgressText(
          multiple && total > 1
            ? `Mengupload ${i + 1} dari ${total} foto ke Cloudinary (${folder})...`
            : `Mengupload "${file.name}" ke Cloudinary (${folder})...`
        );

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal mengupload foto ke Cloudinary');
        }

        uploadedUrls.push(data.url);
      }

      setSuccessMessage(
        uploadedUrls.length === 1
          ? '1 foto berhasil diupload ke folder UNDANGAN!'
          : `${uploadedUrls.length} foto berhasil diupload ke folder UNDANGAN!`
      );
      onUploaded(uploadedUrls);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat upload');
    } finally {
      setUploading(false);
      setProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Compact Button View (for quick upload on bride/groom/cover fields)
  if (compact) {
    return (
      <div className="inline-flex flex-col gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-[#d7ac64]/15 hover:text-[#2b3951] text-slate-700 border border-slate-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d7ac64]" />
              <span className="text-[11px]">Mengupload...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5 text-[#d7ac64]" />
              <span>{label}</span>
            </>
          )}
        </button>

        {errorMessage && (
          <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}
        {successMessage && (
          <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
            <span>{successMessage}</span>
          </p>
        )}
      </div>
    );
  }

  // Full High-End Drag & Drop Zone (for Gallery section)
  return (
    <div className="w-full space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer select-none ${
          isDragging
            ? 'border-[#d7ac64] bg-[#d7ac64]/10 scale-[1.008]'
            : 'border-slate-300 hover:border-[#d7ac64]/80 bg-slate-50/70 hover:bg-white'
        } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
              isDragging
                ? 'bg-[#d7ac64] text-white scale-110'
                : 'bg-white border border-slate-200 text-[#2b3951]'
            }`}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#d7ac64]" />
            ) : (
              <UploadCloud className="w-6 h-6 text-[#d7ac64]" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {uploading
                ? progressText || 'Sedang memproses upload...'
                : 'Tarik & Letakkan Foto di Sini, atau Klik untuk Memilih'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Mendukung JPG, PNG, WEBP hingga 10MB per foto.
            </p>
          </div>

          {/* Cloudinary Target Destination Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-[11px] font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Target Cloudinary: Folder <strong className="text-slate-900 font-semibold">{folder}</strong></span>
          </div>
        </div>
      </div>

      {/* Uploading Status Bar */}
      {uploading && (
        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs flex items-center gap-3 animate-in fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
          <span className="font-medium">{progressText}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload Gagal</p>
            <p className="text-[11px] text-red-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
    </div>
  );
}

