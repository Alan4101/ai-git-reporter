"use client"

import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorAlertProps {
  error: string
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="lg:col-span-12"
    >
      <Alert
        variant="destructive"
        className="bg-destructive/10 border-destructive/20 text-destructive-foreground"
      >
        <Sparkles className="h-4 w-4" />
        <AlertTitle>Помилка</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </motion.div>
  )
}
