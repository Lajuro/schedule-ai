"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeSchedule } from "../actions/analyzeSchedule";
import ImageLightbox from "./ImageLightbox";

interface ImageUploaderProps {
  onAnalysisComplete: (
    data: {
      detected_month: string;
      work_days: string[];
      reasoning: string;
    },
    imageUrl: string
  ) => void;
}

export default function ImageUploader({
  onAnalysisComplete,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione uma imagem válida");
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const base64 = await convertToBase64(file);
      setImageBase64(base64);
      setImageType(file.type);
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      setError("Erro ao processar a imagem.");
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setImageBase64(null);
    setImageType(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imageBase64 || !imageType || !previewUrl) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log("📤 Enviando imagem para análise...");
      const result = await analyzeSchedule(imageBase64, imageType);

      if (!result.success) {
        setError(result.error || "Erro ao analisar a imagem");
        return;
      }

      if (result.data) {
        onAnalysisComplete(result.data, previewUrl);
      }
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      setError("Erro ao processar a imagem. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Card principal */}
      <motion.div layout className="rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-900 dark:shadow-gray-950/50 sm:p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
            Upload do Calendário
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Faça upload de uma captura de tela do seu calendário de plantões
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!previewUrl ? (
            /* Dropzone */
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
                isDragging
                  ? "border-blue-500 bg-blue-50 scale-[1.02] dark:bg-blue-950/50"
                  : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={isDragging ? { y: [-5, 5, -5] } : { y: 0 }}
                  transition={
                    isDragging
                      ? { repeat: Infinity, duration: 1.5 }
                      : { duration: 0.2 }
                  }
                  className="rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-5 dark:from-blue-900/50 dark:to-indigo-900/50"
                >
                  <svg
                    className="h-12 w-12 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {isDragging ? "Solte a imagem aqui!" : "Arraste a imagem aqui"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    ou clique para selecionar
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-700">
                  <svg
                    className="h-4 w-4 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG, JPEG</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Preview da imagem */
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              {/* Container da imagem */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  onClick={() => !isAnalyzing && setIsLightboxOpen(true)}
                  className={`group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-100 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 ${
                    isAnalyzing ? "cursor-wait" : "cursor-zoom-in"
                  }`}
                >
                  <div className="relative flex items-center justify-center overflow-hidden"
                       style={{ maxHeight: "300px" }}>
                    <img
                      src={previewUrl}
                      alt="Preview do calendário"
                      className="h-full w-full object-contain"
                    />

                    {/* Overlay de zoom */}
                    {!isAnalyzing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
                        <div className="scale-0 rounded-full bg-white/90 p-3 shadow-lg transition-transform group-hover:scale-100">
                          <svg
                            className="h-6 w-6 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Botão de remover */}
                {!isAnalyzing && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveImage}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>

              {/* Legenda */}
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Clique na imagem para ampliar • Clique no X para remover
              </p>

              {/* Botão de Analisar */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-wait disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <>
                    <div className="relative">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    </div>
                    <span>Analisando com IA...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <span>Analisar Imagem com IA</span>
                  </>
                )}
              </motion.button>

              {/* Status de análise */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950/50 dark:to-indigo-950/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <svg
                          className="h-5 w-5 animate-pulse text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100">
                          Identificando dias de plantão...
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          A IA está analisando cada dia do calendário
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensagem de erro */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/50">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dicas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Dicas para melhor resultado
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 dark:bg-blue-500" />
                Capture a tela inteira do calendário
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 dark:bg-blue-500" />
                Certifique-se que os números dos dias estão visíveis
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 dark:bg-blue-500" />
                As bolinhas azuis devem estar nítidas
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 dark:bg-blue-500" />
                Evite reflexos ou sombras na imagem
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      {previewUrl && (
        <ImageLightbox
          src={previewUrl}
          alt="Preview do calendário em tamanho completo"
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </motion.div>
  );
}
