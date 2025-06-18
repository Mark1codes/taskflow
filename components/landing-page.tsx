"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Calendar,
  BarChart3,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Star,
  LayoutDashboard,
  Kanban,
  Clock,
  Music,
  Headphones,
  Radio,
  PlayCircle,
} from "lucide-react"
import { useEffect, useState } from "react"

interface LandingPageProps {
  onLogin: () => void
  onSignUp: () => void
}

export function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [visibleCards, setVisibleCards] = useState<number[]>([])

  useEffect(() => {
    // Trigger initial animations
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Animate cards one by one
    if (isVisible) {
      features.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards((prev) => [...prev, index])
        }, index * 150)
      })
    }
  }, [isVisible])

  const features = [
    {
      icon: LayoutDashboard,
      title: "Smart Dashboard",
      description: "Get a comprehensive overview of all your tasks with intelligent insights and analytics.",
    },
    {
      icon: Kanban,
      title: "Kanban Boards",
      description: "Visualize your workflow with drag-and-drop Kanban boards for better task management.",
    },
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "Never miss a deadline with our integrated calendar view and smart scheduling.",
    },
    {
      icon: Music,
      title: "Focus Music & Sounds",
      description: "Enhance productivity with curated playlists and ambient sounds designed for deep work.",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your productivity with detailed analytics and progress reports.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work seamlessly with your team through shared tasks and real-time updates.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security and regular backups.",
    },
  ]

  const musicFeatures = [
    {
      icon: PlayCircle,
      title: "Focus Playlists",
      description: "Curated music collections designed to enhance concentration and productivity.",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      icon: Radio,
      title: "Ambient Sounds",
      description: "Nature sounds, white noise, and ambient tracks to create the perfect work environment.",
      gradient: "from-green-600 to-teal-600",
    },
    {
      icon: Headphones,
      title: "Pomodoro Timer",
      description: "Built-in focus timer with music integration for structured work sessions.",
      gradient: "from-blue-600 to-indigo-600",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Project Manager",
      company: "TechCorp",
      content:
        "TaskFlow has revolutionized how our team manages projects. The music feature helps us stay focused during long work sessions.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Startup Founder",
      company: "InnovateLab",
      content:
        "The combination of task management and focus music is genius. Our productivity has increased by 40% since using TaskFlow.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "GrowthCo",
      content:
        "The ambient sounds feature is a game-changer. I can finally concentrate in our open office environment.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className={`flex items-center space-x-2 transition-all duration-700 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </div>
            <div
              className={`flex items-center space-x-4 transition-all duration-700 delay-200 ${
                isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
            >
              <Button variant="ghost" onClick={onLogin}>
                Sign In
              </Button>
              <Button
                onClick={onSignUp}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge
              variant="secondary"
              className={`mb-4 transition-all duration-700 delay-300 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <Zap className="h-3 w-3 mr-1" />
              New: AI-Powered Task Insights + Focus Music
            </Badge>
            <h1
              className={`text-4xl md:text-6xl font-bold text-gray-900 mb-6 transition-all duration-700 delay-500 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              Manage Tasks Like a
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Pro</span>
            </h1>
            <p
              className={`text-xl text-gray-600 mb-8 max-w-3xl mx-auto transition-all duration-700 delay-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              Transform your productivity with TaskFlow's intuitive task management platform. Organize, prioritize, and
              collaborate seamlessly with your team while staying focused with our integrated music features.
            </p>
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-900 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <Button
                size="lg"
                onClick={onSignUp}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onLogin}
                className="text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`relative transition-all duration-1000 delay-1100 ${
              isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl"></div>
            <Card className="relative border-0 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
                <div className="p-8 bg-white rounded-b-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: "Total Tasks", value: "124", change: "+12% from last week" },
                      { title: "Completed", value: "89", change: "72% completion rate" },
                      { title: "Focus Time", value: "8.5h", change: "with music integration" },
                    ].map((stat, index) => (
                      <Card
                        key={index}
                        className={`transform transition-all duration-500 hover:scale-105 ${
                          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                        style={{ transitionDelay: `${1300 + index * 100}ms` }}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{stat.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <p className="text-xs text-muted-foreground">{stat.change}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "1600ms" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to stay organized</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you and your team achieve more, faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isCardVisible = visibleCards.includes(index)

              return (
                <Card
                  key={index}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                    isCardVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
                  }`}
                  style={{
                    transitionDelay: `${1800 + index * 150}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 ${feature.title === "Focus Music & Sounds" ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-gradient-to-r from-blue-600 to-purple-600"} rounded-lg flex items-center justify-center mb-4 transform transition-transform duration-300 hover:rotate-6`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Music Features Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "2000ms" }}
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Music className="h-8 w-8 text-purple-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Focus with Music</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Boost your productivity with our integrated music and ambient sound features designed for deep work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {musicFeatures.map((feature, index) => {
              const Icon = feature.icon

              return (
                <Card
                  key={index}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${2200 + index * 200}ms` }}
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto transform transition-transform duration-300 hover:rotate-12`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-center mb-3">{feature.title}</h3>
                    <p className="text-gray-600 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div
            className={`text-center mt-12 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "2800ms" }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200"
            >
              <Headphones className="mr-2 h-5 w-5" />
              Try Focus Music Free
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: "50K+", label: "Active Users" },
              { value: "1M+", label: "Tasks Completed" },
              { value: "100K+", label: "Hours of Focus Music" },
              { value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 hover:scale-110 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${2500 + index * 100}ms` }}
              >
                <div className="text-4xl font-bold mb-2 animate-pulse">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "2900ms" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by teams worldwide</h2>
            <p className="text-xl text-gray-600">See what our customers have to say about TaskFlow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`border-0 shadow-lg transform transition-all duration-700 hover:scale-105 hover:shadow-xl ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${3100 + index * 200}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "3700ms" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to boost your productivity?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of teams already using TaskFlow to get more done with the power of music and smart task
              management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={onSignUp}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200"
              >
                <Clock className="mr-2 h-5 w-5" />
                No Credit Card Required
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`grid grid-cols-1 md:grid-cols-4 gap-8 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "3900ms" }}
          >
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">TaskFlow</span>
              </div>
              <p className="text-gray-400">
                The modern task management platform for productive teams with integrated focus music.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Features</li>
                <li className="hover:text-white transition-colors cursor-pointer">Music & Sounds</li>
                <li className="hover:text-white transition-colors cursor-pointer">Integrations</li>
                <li className="hover:text-white transition-colors cursor-pointer">API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">About</li>
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-white transition-colors cursor-pointer">Community</li>
                <li className="hover:text-white transition-colors cursor-pointer">Status</li>
              </ul>
            </div>
          </div>
          <div
            className={`border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "4100ms" }}
          >
            <p>&copy; 2024 TaskFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
