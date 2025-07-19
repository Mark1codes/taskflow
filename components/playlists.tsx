"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Music, Play, Plus, Search, Clock, Heart, Headphones, Brain, Coffee, Zap, Moon, Sun } from "lucide-react"
import  supabase  from "../utils/supabase"
import { searchDiscogs } from "@/lib/discogs"
import { DiscogsSearchResult } from "@/types/discogs"
import { v4 as uuidv4 } from "uuid"

interface Playlist {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_gradient: string | null
  icon_name: string | null
  category: string
  total_tracks: number
  total_duration: number
  play_count: number
  playlist_tracks: { track: Track }[]
}

interface Track {
  id: string
  title: string
  artists: { name: string }
  duration: number
  genres: { name: string } | null
}

export function Playlists() {
  const [searchTerm, setSearchTerm] = useState("")
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [discogsSearchTerm, setDiscogsSearchTerm] = useState("")
  const [discogsResults, setDiscogsResults] = useState<DiscogsSearchResult[]>([])
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [stats, setStats] = useState({ totalPlaylists: 0, totalDuration: 0, totalPlays: 0, favorites: 0 })

  useEffect(() => {
    fetchPlaylists()
    fetchStats()
  }, [])

  const fetchPlaylists = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("playlists")
      .select(`
        id, user_id, name, description, cover_gradient, icon_name, category, total_tracks, total_duration, play_count,
        playlist_tracks (track:tracks(id, title, duration, artists(name), genres(name)))
      `)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error fetching playlists:", error)
      return
    }

    setPlaylists(data || [])
    const uniqueCategories = ["All", ...new Set(data.map((p: Playlist) => p.category))]
    setCategories(uniqueCategories)
  }

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: playlists, error: playlistsError } = await supabase
      .from("playlists")
      .select("total_duration, play_count")
      .eq("user_id", user.id)

    const { data: favorites, error: favoritesError } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_type", "playlist")

    if (playlistsError || favoritesError) {
      console.error("Error fetching stats:", playlistsError || favoritesError)
      return
    }

    const totalPlaylists = playlists?.length || 0
    const totalDuration = playlists?.reduce((sum, p) => sum + p.total_duration, 0) / 3600 || 0
    const totalPlays = playlists?.reduce((sum, p) => sum + p.play_count, 0) || 0
    const totalFavorites = favorites?.length || 0

    setStats({
      totalPlaylists,
      totalDuration,
      totalPlays,
      favorites: totalFavorites,
    })
  }

  const createPlaylist = async () => {
    if (!newPlaylistName) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        user_id: user.id,
        name: newPlaylistName,
        description: "Custom playlist",
        cover_gradient: "bg-gradient-to-br from-purple-600 to-pink-600",
        icon_name: "Music",
        category: "Custom",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating playlist:", error)
      return
    }

    setPlaylists((prev) => [...prev, data])
    setNewPlaylistName("")
  }

  const handleDiscogsSearch = async () => {
    if (!discogsSearchTerm) return
    const results = await searchDiscogs(discogsSearchTerm, "release")
    setDiscogsResults(results)
  }

  const addTrackToPlaylist = async (playlistId: string, result: DiscogsSearchResult) => {
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
        genre_id: null,
        file_url: null,
      })
      .select()
      .single()

    if (trackError) {
      console.error("Error adding track:", trackError)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: playlistTracks, error: playlistError } = await supabase
      .from("playlist_tracks")
      .insert({
        playlist_id: playlistId,
        track_id: track.id,
        position: playlists.find((p) => p.id === playlistId)?.total_tracks || 0,
        added_by: user.id,
      })

    if (playlistError) {
      console.error("Error adding track to playlist:", playlistError)
      return
    }

    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? {
              ...p,
              total_tracks: p.total_tracks + 1,
              total_duration: p.total_duration + track.duration,
              playlist_tracks: [...p.playlist_tracks, { track: { ...track, artists: { name: artist.name }, genres: null } }],
            }
          : p
      )
    )
    setDiscogsResults([])
    setDiscogsSearchTerm("")
  }

  const parseDuration = (duration: string) => {
    const [minutes, seconds] = duration.split(":").map(Number)
    return minutes * 60 + seconds
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const filteredPlaylists = playlists.filter((playlist) => {
    const matchesSearch =
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || playlist.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Brain,
    Zap,
    Sun,
    Coffee,
    Moon,
    Heart,
    Music,
  }

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-screen">
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Playlists</h1>
              <p className="text-muted-foreground">Curated music collections for every mood</p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => setNewPlaylistName("New Playlist")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search playlists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            {/* Discogs Search for Adding Tracks */}
            <div className="mt-4 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Discogs to add tracks..."
                  value={discogsSearchTerm}
                  onChange={(e) => setDiscogsSearchTerm(e.target.value)}
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
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-muted-foreground">{result.artist}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const playlist = playlists[0] // Default to first playlist; enhance with dropdown
                        if (playlist) addTrackToPlaylist(playlist.id, result)
                      }}
                    >
                      Add to Playlist
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPlaylists.map((playlist) => {
            const Icon = iconMap[playlist.icon_name || "Music"] || Music
            return (
              <Card
                key={playlist.id}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-0">
                  <div className={`relative h-48 ${playlist.cover_gradient || "bg-gradient-to-br from-purple-600 to-pink-600"} rounded-t-lg overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="h-16 w-16 text-white/80" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                      <Button
                        size="icon"
                        className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                      >
                        <Play className="h-6 w-6 text-white ml-1" />
                      </Button>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        {playlist.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{playlist.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Music className="h-3 w-3" />
                          <span>{playlist.total_tracks} tracks</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(playlist.total_duration)}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Headphones className="h-3 w-3" />
                        <span>{playlist.play_count}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Play className="h-4 w-4 mr-2" />
                      Play Playlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Create Custom Playlist */}
        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-purple-600/50 transition-colors">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Create Your Own Playlist</h3>
            <Input
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="mb-4 max-w-xs mx-auto"
            />
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={createPlaylist}
              disabled={!newPlaylistName}
            >
              Create Playlist
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Music className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Total Playlists</p>
                  <p className="text-2xl font-bold">{stats.totalPlaylists}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="text-sm font-medium">Total Duration</p>
                  <p className="text-2xl font-bold">{stats.totalDuration.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Headphones className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Plays</p>
                  <p className="text-2xl font-bold">{stats.totalPlays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Favorites</p>
                  <p className="text-2xl font-bold">{stats.favorites}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}