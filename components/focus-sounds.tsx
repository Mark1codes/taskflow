"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, Cloud, Waves, TreePine, Coffee, Flame, Zap, Moon, Radio, Timer } from "lucide-react"

export function FocusSounds() {
  const [activeSounds, setActiveSounds] = useState<number[]>([])
  const [volumes, setVolumes] = useState<{ [key: number]: number }>({})
  const [focusTimer, setFocusTimer] = useState(25) // Pomodoro default

  const sounds = [
    {
      id: 1,
      name: "Rain",
      description: "Gentle rainfall for deep focus",
      icon: Cloud,
      color: "from-blue-600 to-cyan-600",
      category: "Nature",
    },
    {
      id: 2,
      name: "Ocean Waves",
      description: "Calming ocean sounds",
      icon: Waves,
      color: "from-teal-600 to-blue-600",
      category: "Nature",
    },
    {
      id: 3,
      name: "Forest",
      description: "Birds chirping in the forest",
      icon: TreePine,
      color: "from-green-600 to-emerald-600",
      category: "Nature",
    },
    {
      id: 4,
      name: "Coffee Shop",
      description: "Ambient coffee shop chatter",
      icon: Coffee,
      color: "from-amber-600 to-orange-600",
      category: "Ambient",
    },
    {
      id: 5,
      name: "Fireplace",
      description: "Crackling fireplace sounds",
      icon: Flame,
      color: "from-red-600 to-orange-600",
      category: "Ambient",
    },
    {
      id: 6,
      name: "White Noise",
      description: "Pure white noise for concentration",
      icon: Radio,
      color: "from-gray-600 to-slate-600",
      category: "Noise",
    },
    {
      id: 7,
      name: "Thunder",
      description: "Distant thunder and rain",
      icon: Zap,
      color: "from-purple-600 to-indigo-600",
      category: "Nature",
    },
    {
      id: 8,
      name: "Night Sounds",
      description: "Peaceful nighttime ambience",
      icon: Moon,
      color: "from-indigo-600 to-purple-600",
      category: "Ambient",
    },
  ]

  const categories = ["All", "Nature", "Ambient", "Noise"]
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredSounds = sounds.filter((sound) => selectedCategory === "All" || sound.category === selectedCategory)

  const toggleSound = (soundId: number) => {
    setActiveSounds((prev) => {
      if (prev.includes(soundId)) {
        return prev.filter((id) => id !== soundId)
      } else {
        return [...prev, soundId]
      }
    })

    if (!volumes[soundId]) {
      setVolumes((prev) => ({ ...prev, [soundId]: 50 }))
    }
  }

  const updateVolume = (soundId: number, volume: number) => {
    setVolumes((prev) => ({ ...prev, [soundId]: volume }))
  }

  const stopAllSounds = () => {
    setActiveSounds([])
  }

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-screen">
      <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Radio className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Focus Sounds</h1>
              <p className="text-muted-foreground">Ambient sounds to enhance your concentration</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{activeSounds.length} active</span>
            </Badge>
            {activeSounds.length > 0 && (
              <Button variant="outline" onClick={stopAllSounds}>
                Stop All
              </Button>
            )}
          </div>
        </div>

        {/* Focus Timer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span>Focus Timer</span>
            </CardTitle>
            <CardDescription>Set a timer for your focus session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-2xl font-bold">{focusTimer} min</span>
                </div>
                <Slider
                  value={[focusTimer]}
                  onValueChange={(value) => setFocusTimer(value[0])}
                  max={120}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setFocusTimer(25)}
                  className={focusTimer === 25 ? "bg-green-100" : ""}
                >
                  25m
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFocusTimer(45)}
                  className={focusTimer === 45 ? "bg-green-100" : ""}
                >
                  45m
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFocusTimer(60)}
                  className={focusTimer === 60 ? "bg-green-100" : ""}
                >
                  60m
                </Button>
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                Start Timer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-gradient-to-r from-green-600 to-teal-600" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Sounds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSounds.map((sound) => {
            const Icon = sound.icon
            const isActive = activeSounds.includes(sound.id)
            const volume = volumes[sound.id] || 50

            return (
              <Card
                key={sound.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isActive ? "ring-2 ring-green-500 shadow-lg" : ""
                }`}
              >
                <CardContent className="p-0">
                  {/* Sound Visual */}
                  <div className={`relative h-32 bg-gradient-to-br ${sound.color} rounded-t-lg overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="h-12 w-12 text-white/90" />
                    </div>

                    {/* Play/Pause Overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => toggleSound(sound.id)}
                    >
                      <Button
                        size="icon"
                        className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                      >
                        {isActive ? (
                          <Pause className="h-6 w-6 text-white" />
                        ) : (
                          <Play className="h-6 w-6 text-white ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs"
                      >
                        {sound.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Sound Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold">{sound.name}</h3>
                      <p className="text-sm text-muted-foreground">{sound.description}</p>
                    </div>

                    {/* Volume Control */}
                    {isActive && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <Slider
                            value={[volume]}
                            onValueChange={(value) => updateVolume(sound.id, value[0])}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground w-8">{volume}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      className={`w-full ${
                        isActive
                          ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                          : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                      }`}
                      onClick={() => toggleSound(sound.id)}
                    >
                      {isActive ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Active Sounds Summary */}
        {activeSounds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Sounds</CardTitle>
              <CardDescription>Currently playing ambient sounds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSounds.map((soundId) => {
                  const sound = sounds.find((s) => s.id === soundId)
                  if (!sound) return null

                  const Icon = sound.icon
                  const volume = volumes[soundId] || 50

                  return (
                    <div key={soundId} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${sound.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{sound.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Volume2 className="h-3 w-3 text-muted-foreground" />
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all duration-300"
                              style={{ width: `${volume}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">{volume}%</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => toggleSound(soundId)} className="h-8 w-8">
                        <Pause className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
