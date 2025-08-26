import { NextRequest, NextResponse } from 'next/server'

/**
 * Google Places Autocomplete API endpoint
 * Handles city search requests with proper error handling and rate limiting
 */

interface AutocompleteRequest {
  input: string
}

interface GooglePlacesResponse {
  predictions: Array<{
    place_id: string
    description: string
    structured_formatting: {
      main_text: string
      secondary_text: string
    }
    types: string[]
  }>
  status: string
}

async function handleAutocomplete(input: string) {
  // Validate input
  if (!input || typeof input !== 'string' || input.trim().length < 2) {
    return NextResponse.json(
      { error: 'Input must be at least 2 characters long' },
      { status: 400 }
    )
  }

  // Check for API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('Google Places API key not found')
    return NextResponse.json(
      { error: 'API configuration error' },
      { status: 500 }
    )
  }

  // Build Google Places API URL
  const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json'
  const params = new URLSearchParams({
    input: input.trim(),
    types: '(cities)',
    key: apiKey,
    language: 'en',
  })

  try {
    // Make request to Google Places API
    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Google Places API responded with status: ${response.status}`)
    }

    const data: GooglePlacesResponse = await response.json()

    // Handle API errors
    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Places API request denied:', data)
      return NextResponse.json(
        { error: 'API access denied' },
        { status: 403 }
      )
    }

    if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('Google Places API quota exceeded')
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 429 }
      )
    }

    // Transform response to match our interface
    const predictions = data.predictions?.map(prediction => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text || prediction.description,
      secondaryText: prediction.structured_formatting?.secondary_text || '',
      types: prediction.types || [],
    })) || []

    return NextResponse.json({
      predictions,
      status: data.status,
    })

  } catch (error) {
    console.error('Places autocomplete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input')
  
  if (!input) {
    return NextResponse.json(
      { error: 'Input parameter is required' },
      { status: 400 }
    )
  }
  
  return handleAutocomplete(input)
}

export async function POST(request: NextRequest) {
  try {
    const { input }: AutocompleteRequest = await request.json()
    return handleAutocomplete(input)



  } catch (error) {
    console.error('Places autocomplete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}