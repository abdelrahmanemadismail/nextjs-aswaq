import { NextResponse } from 'next/server'

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const q = searchParams.get('q')

    // Construct appropriate URL based on parameters
    let url: string
    let params: URLSearchParams

    if (lat && lon) {
      // Reverse geocoding
      url = `${NOMINATIM_BASE_URL}/reverse`
      params = new URLSearchParams({
        lat,
        lon,
        format: 'json'
      })
    } else if (q) {
      // Forward geocoding
      url = `${NOMINATIM_BASE_URL}/search`
      params = new URLSearchParams({
        q,
        format: 'json',
        countrycodes: 'ae',
        limit: '1'
      })
    } else {
      throw new Error('Invalid parameters')
    }

    // Add required headers
    const headers = {
      'User-Agent': 'AswaqOnline/1.0'
    }

    const response = await fetch(`${url}?${params}`, { headers })
    const data = await response.json()
    console.log(data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode location' },
      { status: 500 }
    )
  }
}