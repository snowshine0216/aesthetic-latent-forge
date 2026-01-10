import { Button } from '@repo/ui'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">RAG Tool</h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Retrieval-Augmented Generation for enhanced AI responses.
        </p>
      </div>

      <div className="flex gap-4">
        <Button variant="primary">Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Part of the Aesthetic Latent Forge monorepo
      </p>
    </main>
  )
}
