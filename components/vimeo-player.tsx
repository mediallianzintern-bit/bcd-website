"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Captions, CaptionsOff, Settings, ChevronRight, ChevronLeft
} from "lucide-react"

interface VimeoPlayerProps {
  videoId: string
  title?: string
  onEnded?: () => void
}

interface VimeoQuality {
  id: string
  label: string
  active: boolean
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function VimeoPlayer({ videoId, title, onEnded }: VimeoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  // Always holds latest onEnded — avoids stale closure in player event handler
  const onEndedRef = useRef(onEnded)
  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [hasCaptions, setHasCaptions] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Settings menu
  const [showSettings, setShowSettings] = useState(false)
  const [settingsPanel, setSettingsPanel] = useState<"main" | "quality" | "speed">("main")
  const [qualities, setQualities] = useState<VimeoQuality[]>([])
  const [currentQuality, setCurrentQuality] = useState("Auto")
  const [currentSpeed, setCurrentSpeed] = useState(1)

  const resetHideTimer = useCallback((playing: boolean) => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (playing) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false)
        setShowSettings(false)
      }, 3000)
    }
  }, [])

  // Track native fullscreen changes (e.g. user presses Esc)
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", onFsChange)
    return () => document.removeEventListener("fullscreenchange", onFsChange)
  }, [])

  useEffect(() => {
    if (!iframeRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let player: any

    import("@vimeo/player").then(({ default: Player }) => {
      player = new Player(iframeRef.current!)
      playerRef.current = player

      player.ready().then(async () => {
        const dur = await player.getDuration()
        setDuration(dur)

        const tracks = await player.getTextTracks()
        if (tracks && tracks.length > 0) setHasCaptions(true)

        try {
          const qs = await player.getQualities()
          if (qs && qs.length > 0) {
            setQualities(qs)
            const active = qs.find((q: VimeoQuality) => q.active)
            if (active) setCurrentQuality(active.label)
          }
        } catch { /* qualities not available */ }

        setIsLoaded(true)
      })

      player.on("play", () => { setIsPlaying(true); resetHideTimer(true) })
      player.on("pause", () => { setIsPlaying(false); resetHideTimer(false) })
      player.on("ended", () => { setIsPlaying(false); resetHideTimer(false); onEndedRef.current?.() })
      player.on("timeupdate", ({ seconds }: { seconds: number }) => setCurrentTime(seconds))
      player.on("qualitychange", ({ id, label }: { id: string; label: string }) => {
        setCurrentQuality(label || id)
      })
    })

    return () => {
      if (player) player.destroy()
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [videoId, resetHideTimer])

  const togglePlay = async () => {
    if (!playerRef.current) return
    isPlaying ? await playerRef.current.pause() : await playerRef.current.play()
  }

  const toggleMute = async () => {
    if (!playerRef.current) return
    if (isMuted) {
      await playerRef.current.setVolume(1)
      setIsMuted(false)
    } else {
      await playerRef.current.setVolume(0)
      setIsMuted(true)
    }
  }

  const toggleCaptions = async () => {
    if (!playerRef.current) return
    if (captionsOn) {
      await playerRef.current.disableTextTrack()
      setCaptionsOn(false)
    } else {
      await playerRef.current.enableTextTrack("en")
      setCaptionsOn(true)
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    // Fullscreen the whole container so our controls stay visible
    if (!isFullscreen) {
      await containerRef.current.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const handleProgressClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newTime = ratio * duration
    await playerRef.current.setCurrentTime(newTime)
    setCurrentTime(newTime)
  }

  const setQuality = async (quality: VimeoQuality) => {
    if (!playerRef.current) return
    await playerRef.current.setQuality(quality.id)
    setCurrentQuality(quality.label)
    setShowSettings(false)
    setSettingsPanel("main")
  }

  const setSpeed = async (speed: number) => {
    if (!playerRef.current) return
    await playerRef.current.setPlaybackRate(speed)
    setCurrentSpeed(speed)
    setShowSettings(false)
    setSettingsPanel("main")
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={() => resetHideTimer(isPlaying)}
      onMouseEnter={() => resetHideTimer(isPlaying)}
      onMouseLeave={() => { if (isPlaying) { setShowControls(false); setShowSettings(false) } }}
    >
      {/* Vimeo iframe — all controls hidden */}
      <iframe
        ref={iframeRef}
        src={(() => {
          const [vid, hash] = videoId.split("/")
          const hashParam = hash ? `&h=${hash}` : ""
          return `https://player.vimeo.com/video/${vid}?autoplay=0&controls=0&title=0&byline=0&portrait=0&badge=0&sidedock=0&share=0&like=0&watchlater=0&collections=0${hashParam}`
        })()}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title || "Video player"}
      />

      {/* Click overlay for play/pause — sits behind settings menu */}
      <div className="absolute inset-0 cursor-pointer" onClick={() => { if (showSettings) { setShowSettings(false); setSettingsPanel("main") } else { togglePlay() } }} />

      {/* Center play/pause button */}
      {isLoaded && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}>
          <button
            onClick={togglePlay}
            className="pointer-events-auto w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary/80 transition-colors"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-1" />}
          </button>
        </div>
      )}

      {/* Settings popup menu */}
      {isLoaded && showSettings && (
        <div className="absolute bottom-16 right-3 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden w-56 z-10 text-white text-sm">
          {settingsPanel === "main" && (
            <>
              {qualities.length > 0 && (
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
                  onClick={() => setSettingsPanel("quality")}
                >
                  <span>Quality</span>
                  <span className="flex items-center gap-1 text-white/60">
                    {currentQuality} <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              )}
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
                onClick={() => setSettingsPanel("speed")}
              >
                <span>Speed</span>
                <span className="flex items-center gap-1 text-white/60">
                  {currentSpeed === 1 ? "Normal" : `${currentSpeed}x`} <ChevronRight className="w-4 h-4" />
                </span>
              </button>
              {hasCaptions && (
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
                  onClick={() => { toggleCaptions(); setShowSettings(false) }}
                >
                  <span>CC / Subtitles</span>
                  <span className="text-white/60">{captionsOn ? "On" : "Off"}</span>
                </button>
              )}
            </>
          )}

          {settingsPanel === "quality" && (
            <>
              <button
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/10"
                onClick={() => setSettingsPanel("main")}
              >
                <ChevronLeft className="w-4 h-4" /> Quality
              </button>
              {qualities.map((q) => (
                <button
                  key={q.id}
                  className={`w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors ${currentQuality === q.label ? "text-primary" : ""}`}
                  onClick={() => setQuality(q)}
                >
                  {q.label}
                </button>
              ))}
            </>
          )}

          {settingsPanel === "speed" && (
            <>
              <button
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/10"
                onClick={() => setSettingsPanel("main")}
              >
                <ChevronLeft className="w-4 h-4" /> Speed
              </button>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  className={`w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors ${currentSpeed === s ? "text-primary" : ""}`}
                  onClick={() => setSpeed(s)}
                >
                  {s === 1 ? "Normal" : `${s}x`}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Bottom controls bar */}
      {isLoaded && (
        <div className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-3 pb-3 pt-8 transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}>
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer hover:h-1.5 transition-all"
            onClick={handleProgressClick}
          >
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Left: play + time */}
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>
              <span className="text-white text-xs tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right: volume + captions + settings + fullscreen + logo */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {hasCaptions && (
                <button
                  onClick={toggleCaptions}
                  className={`transition-colors ${captionsOn ? "text-primary" : "text-white hover:text-primary"}`}
                >
                  {captionsOn ? <Captions className="w-5 h-5" /> : <CaptionsOff className="w-5 h-5" />}
                </button>
              )}

              {/* Settings gear */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); setSettingsPanel("main") }}
                className={`transition-colors ${showSettings ? "text-primary" : "text-white hover:text-primary"}`}
              >
                <Settings className="w-5 h-5" />
              </button>

              <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

              {/* Basecamp Digital logo */}
              <div className="ml-1">
                <Image
                  src="/images/basecamp-logo.png"
                  alt="Basecamp Digital"
                  width={80}
                  height={24}
                  className="h-5 w-auto object-contain opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
