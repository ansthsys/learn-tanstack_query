import { Button } from "@/components/atoms/ui/button"

function Home() {
  return (
    <main className="p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="text-muted-foreground">Tailwind + shadcn ready.</p>
      <div className="flex gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    </main>
  )
}

export default Home
