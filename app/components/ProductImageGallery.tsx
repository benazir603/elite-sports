'use client'

import { useState } from 'react'

interface ProductImageGalleryProps {
  images: string[]
  alt: string
}

export default function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalZoom, setModalZoom] = useState(1)

  const imageList = images.length > 0 ? images : ['https://placehold.co/600x600/f5f5f5/333333.png?text=No+Image']
  const selectedImage = imageList[selectedIndex]
  const hasMultiple = imageList.length > 1

  return (
    <>
      <div className="flex gap-4 h-full">
        {hasMultiple && (
          <div className="flex flex-col gap-3 w-20 overflow-y-auto max-h-[400px]">
            {imageList.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-16 h-16 border rounded-lg overflow-hidden bg-white flex-shrink-0 ${
                  selectedIndex === idx ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-400'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <img
                  src={src}
                  alt={`${alt} view ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}

        <div
          className="flex-1 bg-white rounded-lg overflow-hidden flex items-center justify-center cursor-zoom-in"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={selectedImage}
            alt={alt}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4"
          onClick={() => {
            setIsModalOpen(false)
            setModalZoom(1)
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsModalOpen(false)
              setModalZoom(1)
            }}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex gap-6 w-full max-w-6xl h-full max-h-[90vh]">
            {hasMultiple && (
              <div className="hidden md:flex flex-col gap-3 w-20 overflow-y-auto p-1">
                {imageList.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setSelectedIndex(idx); setModalZoom(1) }}
                    className={`w-16 h-16 border rounded-lg overflow-hidden bg-white flex-shrink-0 ${
                      selectedIndex === idx ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${alt} view ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              className="flex-1 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setModalZoom((z) => (z === 1 ? 2 : 1)) }}
            >
              <img
                src={selectedImage}
                alt={alt}
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{ transform: `scale(${modalZoom})` }}
              />
            </div>
          </div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            Click image to {modalZoom === 1 ? 'zoom in' : 'zoom out'}
          </p>
        </div>
      )}
    </>
  )
}
