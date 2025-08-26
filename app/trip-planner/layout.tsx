'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Background } from '@/components/background'
import { AuthModal } from '@/components/auth-modal'
import { LogOut } from 'lucide-react'

export default function TripPlannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      // Close modal when user signs in
      if (session?.user) {
        setShowAuthModal(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuthModal(true)
  }

  const handleSignUp = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  const handleGoToWelcome = () => {
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <Background 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/alt-g7Cv2QzqL3k6ey3igjNYkM32d8Fld7.mp4" 
          placeholder="/alt-placeholder.png" 
        />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-lg text-white font-medium backdrop-blur-sm bg-white/10 px-6 py-3 rounded-full border border-white/20">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <Background 
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/alt-g7Cv2QzqL3k6ey3igjNYkM32d8Fld7.mp4" 
        placeholder="/alt-placeholder.png" 
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 p-inset">
          <div className="flex justify-between items-center backdrop-blur-sm bg-white/10 rounded-full px-6 py-3 border border-white/20 shadow-lg">
            <div className="flex items-center space-x-8">
              <Link href="/" className="font-fredericka text-2xl font-bold text-white hover:text-white/80 transition-colors">
                TripMeOut
              </Link>
              <Link href="/trip-planner" className="text-white/90 hover:text-white transition-colors font-medium">
                My Trips
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-white/80 font-medium">
                    {user.email}
                  </span>
                  <Button 
                    onClick={handleSignOut} 
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 rounded-full flex items-center gap-2"
                    variant="outline"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleGoToWelcome}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground backdrop-blur-sm transition-all duration-200 rounded-full shadow-button hover:shadow-button-hover"
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 p-inset min-h-screen">
          {children}
        </main>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  )
}