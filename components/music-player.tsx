"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Search,
} from "lucide-react"
import  supabase  from "../utils/supabase"
import { Howl } from "howler"
import { searchDiscogs, getDiscogsRelease } from "@/lib/discogs"
import { DiscogsSearchResult } from "@/types/discogs"

interface Track {
  id: string
  title: string
  artist_id: string
  album_id: string | null
  genre_id: string | null
  duration: number
  file_url: string | null
  artists: { name: string }
  albums: { title: string } | null
  genres: { name: string } | null
}

interface Favorite {
  id: string
  item_type: string
  item_id: string
}

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(240)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [tracks, setTracks] = useState<Track[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [soundInstance, setSoundInstance] = useState<Howl | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [discogsResults, setDiscogsResults] = useState<DiscogsSearchResult[]>([])
  const [stats, setStats] = useState({ tracksPlayed: 0, focusTime: 0, sessions: 0 })

  useEffect(() => {
    fetchTracks()
    fetchFavorites()
    fetchStats()
    return () => {
      soundInstance?.unload()
    }
  }, [])

  const fetchTracks = async () => {
    const { data, error } = await supabase
      .from("tracks")
      .select(`
        id, title, artist_id, album_id, genre_id, duration, file_url,
        artists (name),
        albums (title),
        genres (name)
      `)

    if (error) {
      console.error("Error fetching tracks:", error)
      return
    }

    setTracks(data || [])
    if (data && data.length > 0) {
      setDuration(data[0].duration)
    }
  }

  const fetchFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("user_id", user.id)
      .eq("item_type", "track")

    if (error) {
      console.error("Error fetching favorites:", error)
      return
    }

    setFavorites(data || [])
  }

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: history, error: historyError } = await supabase
      .from("user_listening_history")
      .select("id")
      .eq("user_id", user.id)

    const { data: sessions, error: sessionsError } = await supabase
      .from("focus_sessions")
      .select("actual_duration, id")
      .eq("user_id", user.id)
      .eq("completed", true)

    if (historyError || sessionsError) {
      console.error("Error fetching stats:", historyError || sessionsError)
      return
    }

    const totalTracksPlayed = history?.length || 0
    const totalFocusTime = sessions?.reduce((sum, s) => sum + (s.actual_duration || 0), 0) / 3600 || 0
    const totalSessions = sessions?.length || 0

    setStats({
      tracksPlayed: totalTracksPlayed,
      focusTime: totalFocusTime,
      sessions: totalSessions,
    })
  }

  const handlePlayPause = async () => {
    const track = tracks[currentTrackIndex]
    if (!track) return

    if (isPlaying) {
      soundInstance?.pause()
      setIsPlaying(false)
    } else {
      if (!soundInstance || soundInstance.src !== track.file_url) {
        soundInstance?.unload()
        const newSound = new Howl({
          src: [track.file_url || "/placeholder.mp3"],
          loop: isRepeat,
          volume: volume[0] / 100,
          onplay: () => {
            setInterval(() => {
              setCurrentTime((prev) => {
                if (prev >= duration) {
                  logListeningHistory(track.id)
                  return 0
                }
                return prev + 1
              })
            }, 1000)
          },
          onend: () => {
            if (!isRepeat) handleNext()
          },
        })
        setSoundInstance(newSound)
        newSound.play()
      } else {
        soundInstance.play()
      }
      setIsPlaying(true)
      logListeningHistory(track.id)
    }
  }

  const logListeningHistory = async (trackId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("user_listening_history").insert({
      user_id: user.id,
      track_id: trackId,
      played_duration: Math.floor(currentTime),
      completed: currentTime >= duration,
    })
  }

  const handlePrevious = () => {
    setCurrentTrackIndex((prev) => (prev > 0 ? prev - 1 : tracks.length - 1))
    setCurrentTime(0)
    soundInstance?.unload()
    setIsPlaying(false)
    if (tracks[currentTrackIndex - 1]) {
      setDuration(tracks[currentTrackIndex - 1].duration)
    }
  }

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev < tracks.length - 1 ? prev + 1 : 0))
    setCurrentTime(0)
    soundInstance?.unload()
    setIsPlaying(false)
    if (tracks[currentTrackIndex + 1]) {
      setDuration(tracks[currentTrackIndex + 1].duration)
    }
  }

  const handleProgressChange = (value: number[]) => {
    setCurrentTime(value[0])
    if (soundInstance) {
      soundInstance.seek(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    setIsMuted(value[0] === 0)
    if (soundInstance) {
      soundInstance.volume(value[0] / 100)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (soundInstance) {
      soundInstance.mute(!isMuted)
    }
  }

  const toggleFavorite = async (trackId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isFavorited = favorites.some((f) => f.item_id === trackId)
    if (isFavorited) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("item_type", "track")
        .eq("item_id", trackId)
      setFavorites((prev) => prev.filter((f) => f.item_id !== trackId))
    } else {
      await supabase
        .from("user_favorites")
        .insert({
          user_id: user.id,
          item_type: "track",
          item_id: trackId,
        })
      setFavorites((prev) => [...prev, { id: uuidv4(), user_id: user.id, item_type: "track", item_id: trackId }])
    }
  }

  const handleDiscogsSearch = async () => {
    if (!searchTerm) return
    const results = await searchDiscogs(searchTerm, "release")
    setDiscogsResults(results)
  }

  const addDiscogsTrack = async (result: DiscogsSearchResult) => {
    const release = await getDiscogsRelease(result.id.toString())
    if (!release) return

    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .insert({ name: release.artists[0]?.name || "Unknown Artist" })
      .select()
      .single()

    if (artistError) {
      console.error("Error adding artist:", artistError)
      return
    }

    const { data: track, error: trackError } = await supabase
      .from("tracks")
      .insert({
        title: release.title,
        artist_id: artist.id,
        duration: release.tracklist[0]?.duration ? parseDuration(release.tracklist[0].duration) : 240,
        genre_id: null, // Map genre later if needed
        file_url: null, // Add actual audio URL if available
      })
      .select()
      .single()

    if (trackError) {
      console.error("Error adding track:", trackError)
      return
    }

    setTracks((prev) => [...prev, { ...track, artists: { name: artist.name }, albums: null, genres: null }])
    setDiscogsResults([])
    setSearchTerm("")
  }

  const parseDuration = (duration: string) => {
    const [minutes, seconds] = duration.split(":").map(Number)
    return minutes * 60 + seconds
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentTrack = tracks[currentTrackIndex]

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

        {/* Discogs Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Discogs for tracks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleDiscogsSearch}>Search</Button>
            </div>
            {discogsResults.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {discogsResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg cursor-pointer"
                    onClick={() => addDiscogsTrack(result)}
                  >
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-muted-foreground">{result.artist}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Player */}
        <Card className="overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>
            <CardContent className="relative p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="flex justify-center lg:justify-start">
                  <div className="relative group">
                    <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                      <div className="absolute inset-4 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center">
                        <Music className="h-16 w-16 sm:h-20 sm:w-20 text-white" />
                      </div>
                      <div className="absolute inset-8 border-2 border-white/20 rounded-full"></div>
                      <div className="absolute inset-16 border border-white/10 rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/30 rounded-full"></div>
                    </div>
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
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">{currentTrack?.title || "No Track Selected"}</h2>
                    <p className="text-lg text-muted-foreground mb-1">{currentTrack?.artists.name || ""}</p>
                    <p className="text-sm text-muted-foreground">{currentTrack?.albums?.title || ""}</p>
                    <Badge variant="outline" className="mt-2">
                      {currentTrack?.genres?.name || "Unknown Genre"}
                    </Badge>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
                      className={favorites.some((f) => f.item_id === currentTrack?.id) ? "text-red-500" : ""}
                    >
                      <Heart
                        className={`h-5 w-5 ${favorites.some((f) => f.item_id === currentTrack?.id) ? "fill-current" : ""}`}
                      />
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
                    index === currentTrackIndex
                      ? "bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-200"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrentTrackIndex(index)
                    setCurrentTime(0)
                    setDuration(track.duration)
                    soundInstance?.unload()
                    setIsPlaying(false)
                  }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shrink-0">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{track.artists.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="text-xs mb-1">
                      {track.genres?.name || "Unknown"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{formatTime(track.duration)}</p>
                  </div>
                  {index === currentTrackIndex && isPlaying && (
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
                  <p className="text-2xl font-bold">{stats.tracksPlayed}</p>
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
                  <p className="text-2xl font-bold">{stats.focusTime.toFixed(1)}h</p>
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
                  <p className="text-2xl font-bold">{stats.sessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}