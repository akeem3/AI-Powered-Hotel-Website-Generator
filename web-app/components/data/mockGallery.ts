/**
 * Mock Gallery Images Data
 * 
 * Sample image data for ImageGallery component testing and development.
 * Includes 12 hotel images covering various areas and features.
 */

export interface GalleryImage {
  id: string;
  desktopUrl: string;      // .webp format
  mobileUrl: string;       // .m.webp format
  alt: string;
  caption?: string;
}

export const mockGalleryImages: GalleryImage[] = [
  {
    id: "gallery-001",
    desktopUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80#.m.webp",
    alt: "Modern hotel lobby with elegant seating and chandelier",
    caption: "Welcome to The Sterling Executive"
  },
  {
    id: "gallery-002",
    desktopUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80#.m.webp",
    alt: "Luxurious king-size bedroom with city view",
    caption: "Executive Suite with panoramic views"
  },
  {
    id: "gallery-003",
    desktopUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80#.m.webp",
    alt: "Rooftop infinity pool overlooking the city",
    caption: "Rooftop infinity pool with stunning skyline views"
  },
  {
    id: "gallery-004",
    desktopUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80#.m.webp",
    alt: "Fine dining restaurant with elegant table settings",
    caption: "Award-winning restaurant featuring local cuisine"
  },
  {
    id: "gallery-005",
    desktopUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80#.m.webp",
    alt: "Modern hotel exterior at sunset",
    caption: "Contemporary architecture in the heart of downtown"
  },
  {
    id: "gallery-006",
    desktopUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80#.m.webp",
    alt: "State-of-the-art fitness center with modern equipment",
    caption: "24-hour fitness center with premium equipment"
  },
  {
    id: "gallery-007",
    desktopUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80#.m.webp",
    alt: "Relaxing spa treatment room with ambient lighting",
    caption: "Full-service spa for ultimate relaxation"
  },
  {
    id: "gallery-008",
    desktopUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80#.m.webp",
    alt: "Rooftop bar with evening ambiance and city lights",
    caption: "Signature rooftop bar with craft cocktails"
  },
  {
    id: "gallery-009",
    desktopUrl: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&q=80#.m.webp",
    alt: "Spacious presidential suite with living area",
    caption: "Presidential Suite with separate living quarters"
  },
  {
    id: "gallery-010",
    desktopUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80#.m.webp",
    alt: "Modern conference room with presentation equipment",
    caption: "Fully-equipped conference facilities for business events"
  },
  {
    id: "gallery-011",
    desktopUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80#.m.webp",
    alt: "Elegant hotel bar with premium spirits selection",
    caption: "Premium bar featuring curated wine and spirits"
  },
  {
    id: "gallery-012",
    desktopUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200&q=80#.webp",
    mobileUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600&q=80#.m.webp",
    alt: "Tranquil garden courtyard with water features",
    caption: "Private garden courtyard for peaceful moments"
  }
];

// Export individual images for testing specific scenarios
export const sampleLobbyImage = mockGalleryImages[0];
export const sampleRoomImage = mockGalleryImages[1];
export const samplePoolImage = mockGalleryImages[2];
