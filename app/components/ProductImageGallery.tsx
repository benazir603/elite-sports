'use client'

import { useState } from 'react'

interface ProductImageGalleryProps {
  images: string[]
  alt: string
}

export default function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [origin, setOrigin] = useState('50% 50%')

  const imageList = images.length > 0 ? images : ['https://placehold.co/600x600/f5f5f5/333333.png?text=No+Image']
  const selectedImage = imageList[selectedIndex]
  const hasMultiple = imageList.length > 1

  function changeZoom(change: number) {
    setZoom((current) => Math.min(3, Math.max(1, current + change)))
  }

  return (
    <div className="flex gap-4 h-full">
      {hasMultiple && (
        <div className="flex flex-col gap-3 w-20 overflow-y-auto max-h-[400px]">
          {imageList.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedIndex(idx)
                setZoom(1)
              }}
              className={`w-16 h-16 border rounded-lg overflow-hidden bg-white flex-shrink-0 ${
                selectedIndex === idx ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-400'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={src} alt={`${alt} view ${idx + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      <div
        className={`group relative flex-1 overflow-hidden rounded-lg bg-white ${zoom > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        onMouseEnter={() => setZoom((current) => Math.max(current, 2))}
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          const x = ((event.clientX - bounds.left) / bounds.width) * 100
          const y = ((event.clientY - bounds.top) / bounds.height) * 100
          setOrigin(`${x}% ${y}%`)
        }}
        onMouseLeave={() => {
          setZoom(1)
          setOrigin('50% 50%')
        }}
        onWheel={(event) => {
          event.preventDefault()
          changeZoom(event.deltaY < 0 ? 0.5 : -0.5)
        }}
        onClick={() => setZoom((current) => (current > 1 ? 1 : 2))}
      >
        <img
          src={selectedImage}
          alt={alt}
          draggable={false}
          className="h-full w-full select-none object-contain transition-transform duration-150 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
        />

        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
          Move cursor to zoom · Use mouse wheel
        </div>

        <div className="absolute right-3 top-3 flex overflow-hidden rounded-full bg-white/95 shadow-md opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            disabled={zoom <= 1}
            onClick={(event) => {
              event.stopPropagation()
              changeZoom(-0.5)
            }}
            className="flex h-9 w-10 items-center justify-center text-lg font-bold hover:bg-gray-100 disabled:opacity-30"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="flex h-9 min-w-14 items-center justify-center border-x border-gray-200 px-2 text-xs font-semibold text-gray-700">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            disabled={zoom >= 3}
            onClick={(event) => {
              event.stopPropagation()
              changeZoom(0.5)
            }}
            className="flex h-9 w-10 items-center justify-center text-lg font-bold hover:bg-gray-100 disabled:opacity-30"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
