export default function LearnLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Video skeleton */}
      <div className="w-full aspect-video bg-muted rounded-lg animate-pulse" />
      {/* Title skeleton */}
      <div className="space-y-3 mt-6">
        <div className="h-7 w-2/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}
