export const metadata = {
  title: 'Cymbal Direct',
  description: 'Cymbal Direct is a demo application for a fictional digital-first ecommerce company.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
