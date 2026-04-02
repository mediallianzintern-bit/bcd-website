"use client"

interface YouTubePlayerProps {
  videoId: string
  title?: string
  onEnded?: () => void
}

export function YouTubePlayer({ videoId, title, onEnded }: YouTubePlayerProps) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title || "Video player"}
        onLoad={(e) => {
          // Listen for video end via postMessage
          const handler = (event: MessageEvent) => {
            if (event.origin !== "https://www.youtube.com") return
            try {
              const data = JSON.parse(event.data)
              // YT PlayerState.ENDED = 0
              if (data.event === "onStateChange" && data.info === 0) {
                onEnded?.()
                window.removeEventListener("message", handler)
              }
            } catch { /* ignore */ }
          }
          window.addEventListener("message", handler)
          // Request the iframe to send state change events
          ;(e.target as HTMLIFrameElement).contentWindow?.postMessage(
            JSON.stringify({ event: "listening", id: 1 }),
            "https://www.youtube.com"
          )
        }}
      />
    </div>
  )
}
