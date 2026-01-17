// @ts-nocheck
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import QueryProvider from "@/providers/QueryProvider"
import { AuthProvider } from "@/providers/AuthProvider"
import { AlertProvider } from "@/providers/AlertProvider"

export const metadata = {
  title: 'SUBITO FLEET - Gestion Taxi Finance',
  description: 'Plateforme de gestion de flotte de taxis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <QueryProvider>
          <AuthProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  )
}
