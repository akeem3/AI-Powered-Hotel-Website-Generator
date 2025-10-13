# Backend Integration PRD: Directus CMS & Effective Tours API

> **Status:** Draft v2.0  
> **Last Updated:** 2025-01-19  
> **Based on:** [Project Brief](../brief.md) and [Component Library PRD](./component-library.md)

## PROJECT SCOPE BOUNDARIES

### IN SCOPE:
- Backend API integration for read-only data access
- Content parameter definition and BackBlaze file handling
- Translation file management and delivery
- Booking redirect implementation to Effective Tours
- Error handling and caching strategies

### OUT OF SCOPE:
- Content management interface for hotels
- Real-time data synchronization after delivery
- Payment processing or transaction handling
- Backend infrastructure maintenance
- Database administration or backup services

## Overview

This document defines the detailed requirements for backend integrations with Directus CMS for content management and Effective Tours API for booking functionality. The integration focuses on generation-time data access and booking redirects, with delivered websites having read-only access to content systems.

## Architecture Overview

### Integration Strategy
```
Generation Phase:
LLM Agents ↔ Content Service ↔ [Directus + BackBlaze + Translation Service]

Runtime Phase:
Website Components ↔ Read-Only Service ↔ [Directus + BackBlaze + Effective Tours]
```

#### Core Principles
- **Unified Interface:** Single service layer for all backend operations
- **Component Independence:** Components work without backend-specific knowledge
- **Error Resilience:** Graceful degradation when APIs are unavailable
- **Performance Optimization:** Caching and request optimization
- **Type Safety:** Full TypeScript integration with generated types

## Content Flow Architecture

### Generation Input Specification

The LLM generation workflow receives a hybrid input structure combining direct parameters with BackBlaze file references:

```typescript
interface GenerationInput {
  // Direct parameters (passed to LLM agents)
  hotelBasics: {
    name: string;
    type: 'luxury' | 'boutique' | 'business' | 'resort' | 'budget' | 'eco';
    location: {
      address: string;
      city: string;
      country: string;
      coordinates: [number, number];
    };
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    contactInfo: {
      phone: string;
      email: string;
      website?: string;
    };
    targetAudience: string[];
    specialRequests?: string;
  };
  
  // BackBlaze file references (LLM agents fetch content)
  richContent: {
    roomsDataUrl: string;        // JSON: Room details, pricing, amenities
    amenitiesUrl: string;        // JSON: Hotel amenities and features  
    testimonialsUrl: string;     // JSON: Customer reviews and ratings
    galleryManifestUrl: string;  // JSON: Image metadata and URLs
    logoUrl: string;             // Image: Hotel logo (multiple formats)
    heroImagesUrl: string[];     // Images: Homepage hero images
    additionalContentUrl?: string; // JSON: Custom content blocks
  };
  
  // Configuration
  generationConfig: {
    targetLanguages: string[];   // ['en', 'es', 'fr']
    wireframePreference?: string;
    customStyleRequests?: string;
    complianceRegion: 'GDPR' | 'CCPA' | 'GLOBAL';
    responsiveConfig: {
      devicePriority: 'mobile-first';
      breakpoint: '768px';
      imageOptimization: 'automatic';  // Auto-generate .m.webp variants
      componentStrategies: ComponentStrategy[];
    };
  };
}
```

### BackBlaze File Structure

```typescript
// rooms-data.json
interface RoomsData {
  rooms: {
    id: string;
    name: string;
    description: string;
    shortDescription: string;
    type: string;
    maxGuests: number;
    sizeSqm?: number;
    amenities: string[];
    images: ResponsiveImageSet[];
    pricing: {
      basePrice: number;
      currency: string;
    };
  }[];
}

// amenities.json
interface AmenitiesData {
  hotelAmenities: {
    id: string;
    name: string;
    description?: string;
    icon: string;
    category: string;
    isPremium: boolean;
  }[];
}

// testimonials.json
interface TestimonialsData {
  reviews: {
    guestName: string;
    rating: number;
    review: string;
    stayDate: string;
    roomType?: string;
    isVerified: boolean;
  }[];
}

// gallery-manifest.json
interface GalleryManifest {
  images: ResponsiveImageSet[];
}

// Responsive image set for all content images
interface ResponsiveImageSet {
  id: string;
  desktop: {
    url: string;           // e.g., /images/hotel_lobby_main.webp
    width: number;
    height: number;
    format: 'webp' | 'avif';
    quality: number;
  };
  mobile: {
    url: string;           // e.g., /images/hotel_lobby_main.m.webp
    width: number;
    height: number;
    format: 'webp' | 'avif';
    quality: number;
  };
  fallback: {
    url: string;           // e.g., /images/hotel_lobby_main.jpg
    format: 'jpg' | 'png';
  };
  metadata: {
    altText: string;
    category: 'hero' | 'rooms' | 'gallery' | 'amenities';
    title: string;
    focalPoint?: { x: number; y: number };
  };
}
```

### Translation File Integration

Translation files are generated during the workflow and stored in BackBlaze:

```typescript
// translations-{language}.json
interface TranslationFile {
  metadata: {
    language: string;
    version: string;
    generatedAt: string;
    totalStrings: number;
  };
  ui: {
    navigation: Record<string, string>;
    buttons: Record<string, string>;
    forms: Record<string, string>;
    errors: Record<string, string>;
  };
  content: {
    headings: Record<string, string>;
    descriptions: Record<string, string>;
    amenities: Record<string, string>;
  };
}
```

## Directus CMS Integration

### Purpose
Directus serves as the headless CMS for all hotel content including rooms, amenities, testimonials, gallery images, and hotel information.

### Data Model Specifications

#### Hotels Collection
```typescript
interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'luxury' | 'boutique' | 'business' | 'resort' | 'budget' | 'eco';
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: [number, number]; // [lat, lng]
    timezone: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  social_links: SocialLink[];
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  amenities: string[]; // Relations to amenities
  gallery: string[]; // Relations to gallery_images
  status: 'active' | 'inactive' | 'coming_soon';
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
    og_image?: string;
  };
  created_at: string;
  updated_at: string;
}
```

#### Rooms Collection
```typescript
interface Room {
  id: string;
  hotel_id: string; // Relation to hotels
  name: string;
  slug: string;
  description: string;
  short_description: string;
  type: 'standard' | 'deluxe' | 'suite' | 'presidential' | 'family';
  max_guests: number;
  size_sqm?: number;
  beds: {
    king: number;
    queen: number;
    twin: number;
    sofa_bed: number;
  };
  amenities: string[]; // Relations to amenities
  images: string[]; // Relations to gallery_images
  pricing: {
    base_price: number;
    currency: string;
    pricing_type: 'per_night' | 'per_person' | 'per_stay';
  };
  availability: {
    min_stay: number;
    max_stay?: number;
    advance_booking_days: number;
  };
  room_count: number;
  floor?: number;
  view?: string;
  status: 'available' | 'maintenance' | 'out_of_order';
  effective_tours_room_id?: string; // External ID mapping
  created_at: string;
  updated_at: string;
}
```

#### Amenities Collection
```typescript
interface Amenity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string; // Lucide icon name
  category: 'room' | 'hotel' | 'wellness' | 'business' | 'recreation' | 'dining';
  priority: number; // Display order
  is_premium: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Testimonials Collection
```typescript
interface Testimonial {
  id: string;
  hotel_id: string; // Relation to hotels
  guest_name: string;
  guest_avatar?: string; // Relation to files
  rating: number; // 1-5 stars
  title?: string;
  review: string;
  stay_date: string;
  room_type?: string;
  guest_location?: string;
  is_verified: boolean;
  is_featured: boolean;
  status: 'approved' | 'pending' | 'rejected';
  source: 'direct' | 'booking_com' | 'tripadvisor' | 'google' | 'manual';
  external_id?: string;
  helpful_votes?: number;
  created_at: string;
  updated_at: string;
}
```

#### Gallery Images Collection
```typescript
interface GalleryImage {
  id: string;
  hotel_id: string; // Relation to hotels
  title: string;
  alt_text: string;
  description?: string;
  file_id: string; // Relation to files
  category: 'exterior' | 'interior' | 'rooms' | 'dining' | 'wellness' | 'recreation' | 'events';
  tags: string[];
  room_id?: string; // Optional relation to specific room
  is_featured: boolean;
  display_order: number;
  dimensions: {
    width: number;
    height: number;
  };
  focal_point?: {
    x: number; // 0-1
    y: number; // 0-1
  };
  created_at: string;
  updated_at: string;
}
```

### API Integration Layer

#### Directus Service Class
```typescript
class DirectusService {
  private client: DirectusClient;
  private cache: Map<string, any>;
  private cacheTTL: number = 300000; // 5 minutes

  constructor(config: DirectusConfig) {
    this.client = new DirectusClient(config.baseUrl)
      .with(rest())
      .with(authentication());
    
    this.authenticate(config.token);
  }

  // Hotel operations
  async getHotel(hotelId: string): Promise<Hotel> {
    const cacheKey = `hotel:${hotelId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const hotel = await this.client.request(
        readItem('hotels', hotelId, {
          fields: ['*', 'amenities.*', 'gallery.*', 'social_links.*']
        })
      );
      
      this.setCache(cacheKey, hotel);
      return hotel;
    } catch (error) {
      throw new DirectusError('Failed to fetch hotel', { hotelId, error });
    }
  }

  async getHotelRooms(hotelId: string): Promise<Room[]> {
    const cacheKey = `rooms:${hotelId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const rooms = await this.client.request(
        readItems('rooms', {
          filter: { hotel_id: { _eq: hotelId }, status: { _eq: 'available' } },
          fields: ['*', 'amenities.*', 'images.*'],
          sort: ['pricing.base_price', 'display_order']
        })
      );
      
      this.setCache(cacheKey, rooms);
      return rooms;
    } catch (error) {
      throw new DirectusError('Failed to fetch rooms', { hotelId, error });
    }
  }

  async getTestimonials(hotelId: string, limit: number = 10): Promise<Testimonial[]> {
    try {
      return await this.client.request(
        readItems('testimonials', {
          filter: { 
            hotel_id: { _eq: hotelId }, 
            status: { _eq: 'approved' },
            is_featured: { _eq: true }
          },
          fields: ['*'],
          sort: ['-created_at'],
          limit
        })
      );
    } catch (error) {
      throw new DirectusError('Failed to fetch testimonials', { hotelId, error });
    }
  }

  async getGalleryImages(hotelId: string, category?: string): Promise<GalleryImage[]> {
    try {
      const filter: any = { hotel_id: { _eq: hotelId } };
      if (category) filter.category = { _eq: category };

      return await this.client.request(
        readItems('gallery_images', {
          filter,
          fields: ['*', 'file_id.*'],
          sort: ['display_order', 'created_at']
        })
      );
    } catch (error) {
      throw new DirectusError('Failed to fetch gallery', { hotelId, error });
    }
  }

  // Error handling and caching methods
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

#### React Hooks for Components
```typescript
// Responsive image hook
export function useResponsiveImage(imageSet: ResponsiveImageSet) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return {
    src: isMobile ? imageSet.mobile.url : imageSet.desktop.url,
    fallbackSrc: imageSet.fallback.url,
    alt: imageSet.metadata.altText,
    width: isMobile ? imageSet.mobile.width : imageSet.desktop.width,
    height: isMobile ? imageSet.mobile.height : imageSet.desktop.height,
    isMobile
  };
}

// Device detection hook
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);
  
  return matches;
}

// Hotel data hook
export function useHotel(hotelId: string) {
  return useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: () => directusService.getHotel(hotelId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

// Rooms data hook
export function useHotelRooms(hotelId: string) {
  return useQuery({
    queryKey: ['rooms', hotelId],
    queryFn: () => directusService.getHotelRooms(hotelId),
    staleTime: 2 * 60 * 1000, // 2 minutes (pricing may change)
    cacheTime: 5 * 60 * 1000,
    retry: 3
  });
}

// Testimonials hook
export function useTestimonials(hotelId: string, limit?: number) {
  return useQuery({
    queryKey: ['testimonials', hotelId, limit],
    queryFn: () => directusService.getTestimonials(hotelId, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000
  });
}

// Gallery hook
export function useGallery(hotelId: string, category?: string) {
  return useQuery({
    queryKey: ['gallery', hotelId, category],
    queryFn: () => directusService.getGalleryImages(hotelId, category),
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000
  });
}
```

## Effective Tours API Integration

### Purpose
Effective Tours provides real-time availability, pricing, and booking functionality for hotel reservations. Generated websites integrate via redirect-based booking flow, with Effective Tours handling all payment processing.

### API Specifications

#### Authentication
```typescript
interface EffectiveToursConfig {
  baseUrl: string;
  apiKey: string;
  hotelId: string;
  timeout: number;
  retryAttempts: number;
}

class EffectiveToursAuth {
  private token: string;
  private tokenExpiry: Date;
  
  async authenticate(): Promise<string> {
    if (this.token && this.tokenExpiry > new Date()) {
      return this.token;
    }
    
    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        grant_type: 'api_key'
      })
    });
    
    const data = await response.json();
    this.token = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    
    return this.token;
  }
}
```

#### Availability Check
```typescript
interface AvailabilityRequest {
  hotel_id: string;
  check_in: string; // ISO date
  check_out: string; // ISO date
  guests: {
    adults: number;
    children: number;
    infants?: number;
  };
  rooms: number;
  currency?: string;
}

interface AvailabilityResponse {
  available: boolean;
  rooms: AvailableRoom[];
  total_price: number;
  currency: string;
  search_id: string; // For booking reference
  expires_at: string; // ISO datetime
}

interface AvailableRoom {
  room_id: string;
  room_name: string;
  available_count: number;
  price_per_night: number;
  total_price: number;
  taxes_included: boolean;
  cancellation_policy: CancellationPolicy;
  amenities: string[];
  max_guests: number;
}
```

#### Booking Redirect Flow

The generated website does not handle direct booking creation but redirects users to Effective Tours' hosted booking platform:

```typescript
interface BookingRedirectParams {
  hotel_id: string;
  check_in: string;     // ISO date
  check_out: string;    // ISO date
  adults: number;
  children: number;
  rooms: number;
  room_type?: string;
  promotional_code?: string;
  language?: string;    // User's selected language
  return_url?: string;  // Website URL for post-booking return
}

// BookingWidget constructs redirect URL
const constructBookingUrl = (params: BookingRedirectParams): string => {
  const baseUrl = 'https://booking.effectivetours.com';
  const queryParams = new URLSearchParams(params as any);
  return `${baseUrl}/book?${queryParams.toString()}`;
};

interface SelectedRoom {
  room_id: string;
  quantity: number;
  guests: RoomGuests[];
}

interface RoomGuests {
  adults: GuestInfo[];
  children?: ChildInfo[];
}

interface GuestInfo {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

interface BookingResponse {
  booking_id: string;
  confirmation_number: string;
  status: 'confirmed' | 'pending' | 'failed';
  total_amount: number;
  currency: string;
  check_in: string;
  check_out: string;
  guest_details: GuestDetails;
  payment_status: 'paid' | 'pending' | 'failed';
  cancellation_deadline?: string;
}
```

### Effective Tours Service Implementation

```typescript
class EffectiveToursService {
  private auth: EffectiveToursAuth;
  private config: EffectiveToursConfig;
  private requestQueue: Map<string, Promise<any>>;

  constructor(config: EffectiveToursConfig) {
    this.config = config;
    this.auth = new EffectiveToursAuth(config);
    this.requestQueue = new Map();
  }

  async checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    const requestKey = this.generateRequestKey('availability', request);
    
    // Deduplicate identical requests
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    const promise = this.executeAvailabilityCheck(request);
    this.requestQueue.set(requestKey, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  private async executeAvailabilityCheck(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    const token = await this.auth.authenticate();
    
    try {
      const response = await fetch(`${this.config.baseUrl}/availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new EffectiveToursError(
          `Availability check failed: ${response.status}`,
          { request, status: response.status }
        );
      }

      const data = await response.json();
      return this.transformAvailabilityResponse(data);
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new EffectiveToursError('Availability check timeout', { request });
      }
      throw error;
    }
  }

  async createBooking(request: BookingRequest): Promise<BookingResponse> {
    const token = await this.auth.authenticate();
    
    try {
      const response = await fetch(`${this.config.baseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout * 2) // Longer timeout for bookings
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new EffectiveToursError(
          `Booking creation failed: ${errorData.message}`,
          { request, error: errorData }
        );
      }

      const booking = await response.json();
      return this.transformBookingResponse(booking);
    } catch (error) {
      throw new EffectiveToursError('Booking creation failed', { request, error });
    }
  }

  async getBooking(bookingId: string): Promise<BookingResponse> {
    const token = await this.auth.authenticate();
    
    const response = await fetch(`${this.config.baseUrl}/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new EffectiveToursError(`Booking not found: ${bookingId}`);
    }

    return response.json();
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    const token = await this.auth.authenticate();
    
    const response = await fetch(`${this.config.baseUrl}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      throw new EffectiveToursError(`Cancellation failed for booking: ${bookingId}`);
    }
  }

  private generateRequestKey(type: string, request: any): string {
    return `${type}:${JSON.stringify(request)}`;
  }

  private transformAvailabilityResponse(data: any): AvailabilityResponse {
    // Transform API response to internal format
    return {
      available: data.availability.available,
      rooms: data.rooms.map(this.transformRoom),
      total_price: data.pricing.total,
      currency: data.pricing.currency,
      search_id: data.search_id,
      expires_at: data.expires_at
    };
  }

  private transformBookingResponse(data: any): BookingResponse {
    // Transform API response to internal format
    return {
      booking_id: data.id,
      confirmation_number: data.confirmation,
      status: data.status,
      total_amount: data.total_amount,
      currency: data.currency,
      check_in: data.check_in_date,
      check_out: data.check_out_date,
      guest_details: data.guest,
      payment_status: data.payment.status,
      cancellation_deadline: data.cancellation_deadline
    };
  }
}
```

### React Hooks for Booking Components

```typescript
// Availability check hook
export function useAvailability(request: AvailabilityRequest | null) {
  return useQuery({
    queryKey: ['availability', request],
    queryFn: () => effectiveToursService.checkAvailability(request!),
    enabled: !!request,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 60 * 1000, // 1 minute
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error instanceof EffectiveToursError && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    }
  });
}

// Booking creation mutation
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: BookingRequest) => 
      effectiveToursService.createBooking(request),
    onSuccess: (booking) => {
      // Cache the new booking
      queryClient.setQueryData(['booking', booking.booking_id], booking);
      
      // Invalidate availability queries
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error) => {
      console.error('Booking creation failed:', error);
    }
  });
}

// Booking retrieval hook
export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => effectiveToursService.getBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });
}
```

## Error Handling Strategy

### Custom Error Classes
```typescript
class DirectusError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'DirectusError';
  }
}

class EffectiveToursError extends Error {
  constructor(message: string, public context?: any, public status?: number) {
    super(message);
    this.name = 'EffectiveToursError';
  }
}
```

### Graceful Degradation
```typescript
// Component fallback patterns
export function RoomCard({ roomId }: { roomId: string }) {
  const { data: room, error, isLoading } = useRoom(roomId);
  
  if (isLoading) {
    return <RoomCardSkeleton />;
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Unable to load room details</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }
  
  return <RoomCardContent room={room} />;
}
```

### Retry Logic
```typescript
const retryConfig = {
  directus: {
    attempts: 3,
    delay: 1000,
    backoff: 2,
    retryOn: [408, 429, 500, 502, 503, 504]
  },
  effectiveTours: {
    attempts: 2,
    delay: 2000,
    backoff: 1.5,
    retryOn: [429, 500, 502, 503, 504]
  }
};
```

## Performance Optimization

### Caching Strategy
- **Directus:** 5-15 minute cache for content
- **Effective Tours:** 30-60 second cache for availability
- **Browser Cache:** Aggressive caching for static content
- **Service Worker:** Offline fallbacks

### Request Optimization
- **Batch Requests:** Combine multiple Directus queries
- **Parallel Loading:** Independent API calls in parallel
- **Lazy Loading:** Load data on component visibility
- **Prefetching:** Anticipate user navigation

### Monitoring
- **Response Times:** Track API performance
- **Error Rates:** Monitor integration health
- **Cache Hit Rates:** Optimize caching strategies
- **User Experience:** Track loading states and errors

---

*This PRD defines comprehensive backend integration requirements. All components must implement these patterns for reliable, performant data access.*