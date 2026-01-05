import './globals.css'
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: 'SUBITO FLEET - Gestion Taxi Finance',
  description: 'Plateforme de gestion de flotte de taxis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
