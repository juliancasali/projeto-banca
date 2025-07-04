import { useState, useRef } from "react"
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "./button"

export function FileUpload({ 
  accept = ".csv", 
  maxSize = 5, // MB
  onFileSelect,
  className = "" 
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const validateFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      setError("Por favor, selecione um arquivo CSV.")
      return false
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`O arquivo excede o tamanho máximo de ${maxSize}MB.`)
      return false
    }

    return true
  }

  const processFile = (file) => {
    if (!validateFile(file)) return

    setFile(file)
    setError("")
    if (onFileSelect) onFileSelect(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      processFile(droppedFile)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      processFile(selectedFile)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  const clearFile = () => {
    setFile(null)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (onFileSelect) onFileSelect(null)
  }

  return (
    <div className={`${className}`}>
      {!file ? (
        <div
          className={`border-2 bg-white border-dashed rounded-md p-8 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
          } ${error ? "border-destructive/50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-lg font-medium">
              {isDragging ? "Solte o arquivo aqui" : "Arraste e solte o arquivo CSV aqui"}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              ou
            </div>
            <Button type="button" variant="outline" onClick={handleButtonClick}>
              Selecionar arquivo
            </Button>
            <div className="text-xs text-muted-foreground mt-2">
              Arquivo CSV (até {maxSize}MB)
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-destructive flex items-center gap-1 mt-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
} 