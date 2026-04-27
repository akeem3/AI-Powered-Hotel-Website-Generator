// Mock data factories for testing components

export interface MockRoom {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  image: string;
  description?: string;
  size?: string;
  bedType?: string;
  maxOccupancy?: number;
}

export interface MockBookingData {
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  rooms: number;
  roomType?: string;
  specialRequests?: string;
}

export interface MockHotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  amenities: string[];
  images: string[];
  contact: {
    email: string;
    phone: string;
    website: string;
  };
}

export interface MockHeroSection {
  title: string;
  tagline?: string;
  subtitle?: string;
  headline?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
    ariaLabel?: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    ariaLabel?: string;
  };
  image?: string;
  variant?: {
    style?: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
    layout?: 'centered' | 'split' | 'fullscreen';
    overlay?: 'none' | 'light' | 'dark' | 'gradient';
    height?: 'small' | 'medium' | 'large' | 'fullscreen';
  };
  className?: string;
}

export interface MockNavigationItem {
  id: string;
  label: string;
  href: string;
  isActive?: boolean;
}

// Room data factory
export const createMockRoom = (overrides: Partial<MockRoom> = {}): MockRoom => ({
  id: "test-room-001",
  name: "Test Executive Suite",
  type: "Suite",
  price: 350,
  capacity: 4,
  amenities: ["WiFi", "Workspace", "Mini Bar", "Air Conditioning", "TV"],
  image: "/test-images/room.jpg",
  description: "Spacious executive suite with modern amenities",
  size: "45 sqm",
  bedType: "King Bed",
  maxOccupancy: 4,
  ...overrides,
});

// Booking data factory
export const createMockBookingData = (overrides: Partial<MockBookingData> = {}): MockBookingData => ({
  checkIn: new Date("2025-11-01"),
  checkOut: new Date("2025-11-03"),
  adults: 2,
  children: 0,
  rooms: 1,
  roomType: "Deluxe Room",
  specialRequests: "",
  ...overrides,
});

// Hotel data factory
export const createMockHotel = (overrides: Partial<MockHotel> = {}): MockHotel => ({
  id: "test-hotel-001",
  name: "The Sterling Executive",
  description: "Luxury hotel in the heart of the business district",
  address: "123 Business Ave",
  city: "New York",
  country: "USA",
  rating: 4.8,
  amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Bar", "Gym"],
  images: [
    "/test-images/hotel-exterior.jpg",
    "/test-images/hotel-lobby.jpg",
    "/test-images/hotel-room.jpg"
  ],
  contact: {
    email: "info@sterlingexecutive.com",
    phone: "+1-555-0123",
    website: "https://sterlingexecutive.com"
  },
  ...overrides,
});

// Hero section data factory
export const createMockHeroSection = (overrides: Partial<MockHeroSection> = {}): MockHeroSection => ({
  title: "Welcome to The Sterling Executive",
  tagline: "Experience luxury and comfort in the heart of the city",
  headline: "Where Comfort Meets Prestige",
  primaryCTA: {
    text: "Book Now",
    href: "/booking"
  },
  secondaryCTA: {
    text: "View Rooms",
    href: "/rooms"
  },
  image: "/test-images/hero-bg.jpg",
  variant: {
    style: 'modern',
    layout: 'centered',
    overlay: 'none',
    height: 'medium'
  },
  ...overrides,
});

// Navigation items factory
export const createMockNavigationItems = (
  overrides: Partial<MockNavigationItem>[] = []
): MockNavigationItem[] => {
  const baseItems: MockNavigationItem[] = [
    {
      id: "nav-001",
      label: "Home",
      href: "/",
      isActive: false
    },
    {
      id: "nav-002",
      label: "Rooms",
      href: "/rooms",
      isActive: false
    },
    {
      id: "nav-003",
      label: "Gallery",
      href: "/gallery",
      isActive: false
    },
    {
      id: "nav-004",
      label: "About",
      href: "/about",
      isActive: false
    },
    {
      id: "nav-005",
      label: "Contact",
      href: "/contact",
      isActive: false
    }
  ];

  const baseWithOverrides = baseItems.map((item, index) => ({
    ...item,
    ...overrides[index]
  }));

  const extraItems = overrides.slice(baseItems.length).map((override, extraIndex) => {
    const fallbackIndex = baseItems.length + extraIndex + 1;

    return {
      id: override.id ?? `nav-${String(fallbackIndex).padStart(3, "0")}`,
      label: override.label ?? `Nav Item ${fallbackIndex}`,
      href: override.href ?? "#",
      isActive: override.isActive ?? false,
      ...override
    };
  });

  return [...baseWithOverrides, ...extraItems];
};

// Room list factory
export const createMockRoomList = (count: number = 3, baseOverrides: Partial<MockRoom> = {}): MockRoom[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockRoom({
      id: `test-room-${String(index + 1).padStart(3, '0')}`,
      name: `Test Room ${index + 1}`,
      price: 150 + (index * 50),
      type: index === 0 ? "Standard" : index === 1 ? "Deluxe" : "Suite",
      ...baseOverrides,
    })
  );
};

// Testimonial data factory
export const createMockTestimonial = (overrides = {}) => ({
  id: "testimonial-001",
  name: "John Doe",
  rating: 5,
  comment: "Excellent stay! The staff was very helpful and the room was immaculate.",
  date: new Date("2025-10-15"),
  roomType: "Executive Suite",
  ...overrides,
});

// Contact form data factory
export const createMockContactForm = (overrides = {}) => ({
  name: "Jane Smith",
  email: "jane.smith@example.com",
  phone: "+1-555-0123",
  subject: "General Inquiry",
  message: "I would like to inquire about room availability for next month.",
  ...overrides,
});