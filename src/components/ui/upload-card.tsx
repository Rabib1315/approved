"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { CheckCircle, Camera, UploadCloud } from "lucide-react"
import { motion } from "framer-motion"
import clsx from "clsx"

interface UploadCardProps {
  icon: string
  title: string
  description: string
  uploadedFile?: File | null
  onDrop: (files: File[]) => void
  onTakePhoto: () => void
  accept?: Record<string, string[]>
  className?: string
}

export const UploadCard = ({ 
  icon, 
  title, 
  description, 
  uploadedFile, 
  onDrop, 
  onTakePhoto,
  accept = {
    "application/pdf": [".pdf"],
    "image/*": [".jpg", ".jpeg", ".png", ".heic", ".webp"]
  },
  className = ""
}: UploadCardProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onDrop(acceptedFiles)
    },
    multiple: false,
    accept,
    noClick: true,
  })

  const handleFileUpload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = Object.entries(accept)
      .map(([type, exts]) => exts.map(ext => type + ext).join(','))
      .join(',')
    input.onchange = (ev: any) => {
      if (ev.target.files && ev.target.files[0]) {
        onDrop([ev.target.files[0]])
      }
    }
    input.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: uploadedFile ? 1 : 1.02 }}
      className={className}
    >
      <div
        className={clsx(
          "rounded-xl p-4 mb-4 flex items-center border-2 transition-colors",
          uploadedFile
            ? "border-green-500 bg-green-50"
            : "border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 active:bg-gray-200",
          isDragActive && !uploadedFile && "border-ca-blue bg-blue-50"
        )}
        style={{ minHeight: 90 }}
        {...getRootProps()}
      >
      <input {...getInputProps()} />
      <div className="flex-shrink-0 text-2xl mr-4 select-none">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-gray-900 flex items-center gap-1">
          {title}
          {uploadedFile && <CheckCircle className="w-4 h-4 text-green-500 ml-1" />}
        </div>
        <div className="text-xs text-gray-600 mb-2">{description}</div>
        {uploadedFile ? (
          <div className="text-xs text-green-700 font-medium truncate" title={uploadedFile.name}>
            {uploadedFile.name}
          </div>
        ) : (
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-ca-blue text-white text-xs font-semibold shadow hover:bg-ca-blue/90 active:bg-ca-blue/80 focus:outline-none focus:ring-2 focus:ring-ca-blue"
              onClick={handleFileUpload}
            >
              <UploadCloud className="w-4 h-4 mr-1" /> Upload Files
            </button>
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-ca-blue text-ca-blue text-xs font-semibold bg-white hover:bg-blue-50 active:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-ca-blue"
              onClick={(e) => {
                e.stopPropagation()
                onTakePhoto()
              }}
            >
              <Camera className="w-4 h-4 mr-1" /> Take Photo
            </button>
          </div>
        )}
      </div>
    </div>
    </motion.div>
  )
} 