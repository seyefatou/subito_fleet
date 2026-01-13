// @ts-nocheck
"use client";

import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  value?: string;
  onChange: (file: File | null) => void;
  onDelete?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  isUploading?: boolean;
  className?: string;
}

export default function FileUpload({
  label,
  value,
  onChange,
  onDelete,
  accept = "image/*",
  maxSize = 5,
  disabled = false,
  isUploading = false,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Fichier trop volumineux. Maximum: ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      setError("Format non supporté. Utilisez JPG, PNG, GIF ou WEBP");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleDelete = () => {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onDelete) {
      onDelete();
    } else {
      onChange(null);
    }
  };

  const displayUrl = preview || value;
  const fullUrl = displayUrl && !displayUrl.startsWith('data:')
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${displayUrl}`
    : displayUrl;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {displayUrl ? (
        <div className="relative group">
          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={fullUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.open(fullUrl, '_blank')}
              >
                <Eye className="w-4 h-4" />
              </Button>
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            disabled || isUploading
              ? "bg-slate-100 border-slate-200 cursor-not-allowed"
              : "bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-slate-400"
          )}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Cliquez pour télécharger</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF max {maxSize}MB</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
