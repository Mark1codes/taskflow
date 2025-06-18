"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Music, Play, Plus, Search, Clock, Heart, Headphones, Brain, Coffee, Zap, Moon, Sun } from "lucide-react"

export function Playlists() {
  const [searchTerm, setSearchTerm] = useState("")

  const playlists = [
    {
      id: 1,
      name: "Deep Focus",
      description: "Instrumental tracks for deep concentration",
      tracks: 24,
      duration: "1h 45m",
      cover: "bg-gradient-to-br from-blue-600 to-purple-600",
      icon: Brain,
      category: "Focus",
      plays: 1250,
    },
    {
      id: 2,
      name: "Coding Vibes",
      description: "Electronic beats for programming sessions",
      tracks: 18,
      duration: "1h 12m",
      cover: "bg-gradient-to-br from-green-600 to-teal-600",
      icon: Zap,
      category: "Programming",
      plays: 890,
    },
    {
      id: 3,
      name: "Morning Energy",
      description: "Upbeat tracks to start your day",
      tracks: 15,
      duration: "58m",
      cover: "bg-gradient-to-br from-orange-600 to-yellow-600",
      icon: Sun,
      category: "Energy",
      plays: 567,
    },
    {
      id: 4,
      name: "Coffee Break",
      description: "Relaxing tunes for your break time",
      tracks: 12,
      duration: "42m",
      cover: "bg-gradient-to-br from-amber-600 to-orange-600",
      icon: Coffee,
      category: "Relaxation",
      plays: 423,
    },
    {
      id: 5,
      name: "Night Owl",
      description: "Ambient sounds for late-night work",
      tracks: 20,
      duration: "1h 28m",
      cover: "bg-gradient-to-br from-indigo-600 to-purple-600",
      icon: Moon,
      category: "Ambient",
      plays: 789,
    },
    {
      id: 6,
      name: "Creative Flow",
      description: "Inspiring melodies for creative work",
      tracks: 16,
      duration: "1h 5m",
      cover: "bg-gradient-to-br from-pink-600 to-rose-600",
      icon: Heart,
      category: "Creative",
      plays: 634,
    },
  ]

  const categories = ["All", "Focus", "Programming", "Energy", "Relaxation", "Ambient", "Creative"]
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredPlaylists = playlists.filter((playlist) => {
    const matchesSearch =
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || playlist.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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
          </CardContent>
        </Card>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPlaylists.map((playlist) => {
            const Icon = playlist.icon
            return (
              <Card
                key={playlist.id}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-0">
                  {/* Cover Art */}
                  <div className={`relative h-48 ${playlist.cover} rounded-t-lg overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="h-16 w-16 text-white/80" />
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                      <Button
                        size="icon"
                        className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                      >
                        <Play className="h-6 w-6 text-white ml-1" />
                      </Button>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        {playlist.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Playlist Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{playlist.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Music className="h-3 w-3" />
                          <span>{playlist.tracks} tracks</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{playlist.duration}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Headphones className="h-3 w-3" />
                        <span>{playlist.plays}</span>
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
            <p className="text-muted-foreground mb-4">
              Build a custom playlist tailored to your workflow and preferences
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Get Started
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
                  <p className="text-2xl font-bold">{playlists.length}</p>
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
                  <p className="text-2xl font-bold">7h 30m</p>
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
                  <p className="text-2xl font-bold">4.5K</p>
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
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
