import { PageHeader } from "@/components/molecules/PageHeader"

function Posts() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader title="Posts" description="Manage blog posts" />
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  )
}

export default Posts
