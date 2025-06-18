"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Music,
  Clock,
  Headphones,
} from "lucide-react"

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(240) // 4 minutes
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)

  const tracks = [
    {
      id: 1,
      title: "Focus Flow",
      artist: "Productivity Beats",
      album: "Deep Work Sessions",
      duration: 240,
      genre: "Lo-Fi",
      cover: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 2,
      title: "Coding Vibes",
      artist: "Tech Rhythms",
      album: "Developer's Choice",
      duration: 195,
      genre: "Electronic",
      cover: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 3,
      title: "Ambient Workspace",
      artist: "Calm Collective",
      album: "Office Zen",
      duration: 320,
      genre: "Ambient",
      cover: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 4,
      title: "Creative Energy",
      artist: "Innovation Sounds",
      album: "Brainstorm Sessions",
      duration: 275,
      genre: "Instrumental",
      cover: "/placeholder.svg?height=300&width=300",
    },
  ]

  const currentTrackData = tracks[currentTrack]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev > 0 ? prev - 1 : tracks.length - 1))
    setCurrentTime(0)
  }

  const handleNext = () => {
    setCurrentTrack((prev) => (prev < tracks.length - 1 ? prev + 1 : 0))
    setCurrentTime(0)
  }

  const handleProgressChange = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    setIsMuted(value[0] === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-screen">
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Music Player</h1>
              <p className="text-muted-foreground">Boost your productivity with focus music</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Headphones className="h-3 w-3" />
            <span>Focus Mode</span>
          </Badge>
        </div>

        {/* Main Player */}
        <Card className="overflow-hidden">
          <div className="relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>

            <CardContent className="relative p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Album Art */}
                <div className="flex justify-center lg:justify-start">
                  <div className="relative group">
                    <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                      <div className="absolute inset-4 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center">
                        <Music className="h-16 w-16 sm:h-20 sm:w-20 text-white" />
                      </div>
                      {/* Vinyl effect */}
                      <div className="absolute inset-8 border-2 border-white/20 rounded-full"></div>
                      <div className="absolute inset-16 border border-white/10 rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/30 rounded-full"></div>
                    </div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="icon"
                        className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8 text-white" />
                        ) : (
                          <Play className="h-8 w-8 text-white ml-1" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Track Info & Controls */}
                <div className="space-y-6">
                  {/* Track Information */}
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">{currentTrackData.title}</h2>
                    <p className="text-lg text-muted-foreground mb-1">{currentTrackData.artist}</p>
                    <p className="text-sm text-muted-foreground">{currentTrackData.album}</p>
                    <Badge variant="outline" className="mt-2">
                      {currentTrackData.genre}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={1}
                      onValueChange={handleProgressChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Main Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsShuffle(!isShuffle)}
                      className={isShuffle ? "text-purple-600" : ""}
                    >
                      <Shuffle className="h-5 w-5" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={handlePrevious}>
                      <SkipBack className="h-6 w-6" />
                    </Button>

                    <Button
                      size="icon"
                      className="h-12 w-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={handleNext}>
                      <SkipForward className="h-6 w-6" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsRepeat(!isRepeat)}
                      className={isRepeat ? "text-purple-600" : ""}
                    >
                      <Repeat className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Secondary Controls */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsLiked(!isLiked)}
                      className={isLiked ? "text-red-500" : ""}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                    </Button>

                    <div className="flex items-center space-x-2 flex-1 max-w-32 mx-4">
                      <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted || volume[0] === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <Slider
                        value={isMuted ? [0] : volume}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="flex-1"
                      />
                    </div>

                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Playlist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Music className="h-5 w-5" />
              <span>Focus Playlist</span>
            </CardTitle>
            <CardDescription>Curated tracks to enhance your productivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    index === currentTrack
                      ? "bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-200"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrentTrack(index)
                    setCurrentTime(0)
                    setDuration(track.duration)
                  }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shrink-0">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="text-xs mb-1">
                      {track.genre}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{formatTime(track.duration)}</p>
                  </div>
                  {index === currentTrack && isPlaying && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse"></div>
                      <div className="w-1 h-6 bg-pink-600 rounded-full animate-pulse delay-100"></div>
                      <div className="w-1 h-3 bg-purple-600 rounded-full animate-pulse delay-200"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Music Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Music className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Tracks Played</p>
                  <p className="text-2xl font-bold">127</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="text-sm font-medium">Focus Time</p>
                  <p className="text-2xl font-bold">8.5h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Headphones className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Sessions</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
