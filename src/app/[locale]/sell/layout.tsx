// app/[locale]/sell/layout.tsx

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/listing/sell/ProgressBar'

export default function SellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <ProgressBar />
          </CardContent>
        </Card>
        
        {children}
      </div>
    </main>
  )
}