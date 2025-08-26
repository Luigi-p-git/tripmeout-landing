"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { getCitySuggestions, type PlaceSuggestion } from "@/lib/google-places"
import { getUserFriendlyMessage, type AppError } from "@/lib/error-handling"
import { AnimatePresence, motion } from "framer-motion"

interface CityAutocompleteProps {
  placeholder?: string
  onCitySelect?: (city: PlaceSuggestion) => void
  onSearch?: (query: string) => void
  className?: string
  size?: "default" | "large"
  showSearchButton?: boolean
  value?: string
  onChange?: (value: string) => void
}

/**
 * Beautiful city autocomplete component with glassmorphism design
 * Features debounced search, keyboard navigation, and smooth animations
 */
export function CityAutocomplete({
  placeholder = "Search destinations...",
  onCitySelect,
  onSearch,
  className,
  size = "default",
  showSearchButton = false,
  value: controlledValue,
  onChange,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(controlledValue || "")
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Handle controlled/uncontrolled input
  const displayValue = controlledValue !== undefined ? controlledValue : inputValue
  const debouncedValue = useDebounce(displayValue, 300)

  const handleInputChange = (value: string) => {
    if (controlledValue !== undefined) {
      onChange?.(value)
    } else {
      setInputValue(value)
    }
    setSelectedIndex(-1)
    setError(null)
  }

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      console.log('fetchSuggestions called with:', debouncedValue)
      
      if (!debouncedValue || debouncedValue.length < 2) {
        console.log('Clearing suggestions - value too short')
        setSuggestions([])
        setIsOpen(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)
      console.log('Starting API call for:', debouncedValue)

      try {
        const results = await getCitySuggestions(debouncedValue)
        console.log('API results:', results)
        setSuggestions(results)
        setIsOpen(results.length > 0)
        console.log('Setting isOpen to:', results.length > 0)
        setRetryCount(0) // Reset retry count on success
      } catch (err) {
        console.error('Error fetching suggestions:', err)
        
        // Handle AppError with user-friendly messages
        if (err && typeof err === 'object' && 'type' in err) {
          const appError = err as AppError
          setError(getUserFriendlyMessage(appError))
          
          // Show retry option for retryable errors
          if (appError.retryable && retryCount < 2) {
            setError(`${getUserFriendlyMessage(appError)} Click to retry.`)
          }
        } else {
          setError('Unable to fetch suggestions. Please try again.')
        }
        
        setSuggestions([])
        setIsOpen(true) // Keep dropdown open to show error
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedValue, retryCount])

  // Handle retry functionality
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && onSearch) {
        onSearch(displayValue)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        } else if (onSearch) {
          onSearch(displayValue)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: PlaceSuggestion) => {
    handleInputChange(suggestion.mainText)
    setIsOpen(false)
    setSelectedIndex(-1)
    onCitySelect?.(suggestion)
    inputRef.current?.blur()
  }

  // Handle search button click
  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(displayValue)
    }
  }

  // Handle clear button
  const handleClear = () => {
    handleInputChange("")
    setIsOpen(false)
    setSuggestions([])
    inputRef.current?.focus()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [selectedIndex])

  const isLarge = size === "large"
  const inputHeight = isLarge ? "h-16" : "h-11"
  const inputPadding = isLarge ? "pl-14 pr-32" : "pl-10 pr-4"
  const iconSize = isLarge ? "h-6 w-6" : "h-4 w-4"
  const iconPosition = isLarge ? "left-4" : "left-3"

  return (
    <div className={cn("relative w-full", className)}>
      {/* Input Container */}
      <div className="relative">
        {/* Search Icon */}
        <div className={cn(
          "absolute top-1/2 transform -translate-y-1/2 z-10",
          iconPosition
        )}>
          {isLoading ? (
            <Loader2 className={cn(iconSize, "text-white/60 animate-spin")} />
          ) : (
            <Search className={cn(iconSize, "text-white/60")} />
          )}
        </div>

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          className={cn(
            inputHeight,
            inputPadding,
            isLarge ? "text-lg" : "text-base",
            "bg-white/10 border-white/30 text-white placeholder:text-white/70",
            "focus:bg-white/15 focus:border-white/50 rounded-full backdrop-blur-md",
            isLarge ? "shadow-2xl" : "shadow-lg",
            "transition-all duration-200"
          )}
        />

        {/* Clear Button */}
        {displayValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 z-10",
              showSearchButton ? "right-20" : "right-3",
              "h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
            )}
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Search Button */}
        {showSearchButton && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Button
              type="button"
              onClick={handleSearchClick}
              className={cn(
                isLarge ? "h-12 px-6" : "h-8 px-4",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "backdrop-blur-sm transition-all duration-200 rounded-full",
                "shadow-button hover:shadow-button-hover"
              )}
            >
              <Search className={cn(isLarge ? "h-5 w-5 mr-2" : "h-4 w-4 mr-1")} />
              Search
            </Button>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (suggestions.length > 0 || error) && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full left-0 right-0 mt-2",
            "bg-white/10 backdrop-blur-md border border-white/20",
            "rounded-2xl shadow-2xl overflow-hidden",
            "max-h-80 overflow-y-auto"
          )}
          style={{ zIndex: 9999 }}
        >
            {error ? (
              <div className="p-4 text-center">
                <div className="text-red-300 text-sm mb-2">
                  {error.replace(' Click to retry.', '')}
                </div>
                {error.includes('Click to retry') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRetry}
                    className="text-white/80 hover:text-white hover:bg-white/10 text-xs"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            ) : (
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.placeId}
                    ref={(el) => {
                      suggestionRefs.current[index] = el
                    }}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer",
                      "transition-all duration-150 ease-out",
                      "hover:bg-white/10",
                      selectedIndex === index && "bg-white/15"
                    )}
                  >
                    <MapPin className="h-4 w-4 text-white/60 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {suggestion.mainText}
                      </div>
                      {suggestion.secondaryText && (
                        <div className="text-white/70 text-sm truncate">
                          {suggestion.secondaryText}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  )
}