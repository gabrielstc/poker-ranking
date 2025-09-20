'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  label?: string
  value?: string
  onChange: (dataUrl: string | null) => void
  placeholder?: string
  className?: string
  maxSizeMB?: number
  acceptedTypes?: string[]
}

export default function ImageUpload({
  label = "Imagem",
  value,
  onChange,
  placeholder = "Clique para selecionar uma imagem ou arraste aqui",
  className = "",
  maxSizeMB = 2, // Reduzir para 2MB
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resizeImage = useCallback((file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height)

        // Converter para base64
        const dataUrl = canvas.toDataURL(file.type, quality)
        resolve(dataUrl)
      }

      img.onerror = () => reject(new Error('Erro ao processar imagem'))
      img.src = URL.createObjectURL(file)
    })
  }, [])

  const handleFileUpload = useCallback(async (file: File) => {
    // Validações
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Tipo de arquivo não permitido. Use: ${acceptedTypes.join(', ')}`)
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${maxSizeMB}MB`)
      return
    }

    setIsUploading(true)

    try {
      let finalDataUrl: string

      // Se o arquivo for muito grande, tentar redimensionar primeiro
      if (file.size > 1024 * 1024) { // Se maior que 1MB
        try {
          console.log('Redimensionando imagem...')
          finalDataUrl = await resizeImage(file)
          
          // Usar a imagem redimensionada diretamente
          onChange(finalDataUrl)
          toast.success('Imagem processada e carregada com sucesso!')
          return
        } catch (resizeError) {
          console.log('Erro no redimensionamento, tentando upload normal:', resizeError)
          // Se falhar o redimensionamento, continuar com upload normal
        }
      }

      // Upload normal via API
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Erro no upload'
        
        // Verificar se a resposta é JSON
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json()
            errorMessage = error.error || `Erro ${response.status}: ${response.statusText}`
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
        } else {
          // Se não é JSON, pegar o texto da resposta
          try {
            const text = await response.text()
            errorMessage = text.length > 100 ? `Erro ${response.status}: ${response.statusText}` : text
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
        }
        
        throw new Error(errorMessage)
      }

      // Verificar se a resposta de sucesso é JSON válido
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta inválida do servidor')
      }

      const result = await response.json()
      
      if (!result.success || !result.dataUrl) {
        throw new Error('Resposta incompleta do servidor')
      }
      
      onChange(result.dataUrl)
      toast.success('Imagem carregada com sucesso!')

    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erro no upload')
    } finally {
      setIsUploading(false)
    }
  }, [acceptedTypes, maxSizeMB, onChange, resizeImage])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleRemove = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium mb-2 block">{label}</Label>
      )}
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {value ? (
            // Preview da imagem
            <div className="relative group">
              <div className="aspect-video w-full max-w-[300px] mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Preview da logo do clube"
                  className="w-full h-full object-contain bg-gray-50 rounded"
                />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleClick}
                  className="h-8"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Trocar
                </Button>
              </div>
            </div>
          ) : (
            // Área de upload
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors hover:border-primary/50 hover:bg-primary/5
                ${isDragOver ? 'border-primary bg-primary/10' : 'border-gray-300'}
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <div className="flex flex-col items-center space-y-4">
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="text-sm text-gray-600">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                      <ImageIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {placeholder}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <AlertCircle className="w-3 h-3" />
                      <span>Máximo {maxSizeMB}MB • {acceptedTypes.join(', ')}</span>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Arquivo
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}