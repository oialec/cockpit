import './globals.css'
export const metadata = { title: 'COCKPIT', description: 'Sistema de Reentrada' }
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600;700&display=swap" rel="stylesheet" /></head>
      <body>{children}</body>
    </html>
  )
}
