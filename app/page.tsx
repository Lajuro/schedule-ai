"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400"></div>
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-blue-400 opacity-20"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
      },
    },
  };

  const features = [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Upload Inteligente",
      description: "Arraste sua imagem do calendário e deixe a IA fazer o trabalho",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Análise com IA",
      description: "Detectamos automaticamente seus dias de trabalho com precisão",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Sync com Calendar",
      description: "Sincronize instantaneamente com o Google Calendar",
    },
  ];

  return (
    <div className="relative flex min-h-screen gradient-background">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-300/50 blur-3xl dark:bg-blue-900/30"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-300/50 blur-3xl dark:bg-purple-900/30"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-900/20"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-12 lg:py-0"
        >
          <div className="mx-auto max-w-lg lg:mx-0">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.3 }}
              className="mb-8 inline-flex"
            >
              <div className="gradient-primary rounded-2xl p-4 shadow-lg shadow-blue-500/25">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 lg:text-5xl"
            >
              <span className="gradient-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Escala-IA</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mb-8 text-lg text-gray-600 dark:text-gray-400"
            >
              Transforme fotos do seu calendário de plantões em eventos no Google Calendar usando Inteligência Artificial.
            </motion.p>

            {/* Features */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-blue-200 hover:bg-white/80 dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-blue-800 dark:hover:bg-gray-900/80"
                >
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Login card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
          >
            {/* Card header */}
            <motion.div variants={itemVariants} className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Bem-vindo
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Faça login para sincronizar seus plantões
              </p>
            </motion.div>

            {/* How it works */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:from-blue-950/50 dark:to-indigo-950/50"
            >
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Como funciona
              </h3>
              <ol className="space-y-3">
                {[
                  { step: 1, text: "Faça login com sua conta Google" },
                  { step: 2, text: "Faça upload da imagem do calendário" },
                  { step: 3, text: "A IA identifica seus dias de trabalho" },
                  { step: 4, text: "Confirme e sincronize com sua agenda" },
                ].map((item) => (
                  <motion.li
                    key={item.step}
                    variants={itemVariants}
                    className="flex items-center gap-3 text-sm text-blue-800 dark:text-blue-300"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700 dark:bg-blue-800 dark:text-blue-200">
                      {item.step}
                    </span>
                    {item.text}
                  </motion.li>
                ))}
              </ol>
            </motion.div>

            {/* Login button */}
            <motion.div variants={itemVariants} className="space-y-4">
              <motion.button
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-medium text-gray-700 shadow-lg transition-all hover:border-gray-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600"
              >
                {/* Animated background */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: isHovering ? "0%" : "-100%" }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
                />
                
                <svg className="relative h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="relative">Entrar com Google</span>
              </motion.button>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Ao continuar, você concorda em compartilhar acesso ao seu Google Calendar
              </p>
            </motion.div>

            {/* Security badge */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50"
            >
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Conexão Segura</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Autenticação OAuth 2.0 do Google</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-0 right-0 border-t border-gray-100/50 bg-white/30 px-6 py-4 backdrop-blur-sm dark:border-gray-800/50 dark:bg-gray-900/30"
      >
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Escala-IA © 2026 • Feito com ❤️ para profissionais de plantão
        </p>
      </motion.footer>
    </div>
  );
}
