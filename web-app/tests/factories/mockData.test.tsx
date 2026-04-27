import {
  createMockRoom,
  createMockBookingData,
  createMockHotel,
  createMockHeroSection,
  createMockNavigationItems,
  createMockRoomList,
  createMockTestimonial,
  createMockContactForm
} from './mockData';

describe('Mock Data Factories', () => {
  describe('createMockRoom', () => {
    it('should create a room with default values', () => {
      const room = createMockRoom();

      expect(room.id).toBe('test-room-001');
      expect(room.name).toBe('Test Executive Suite');
      expect(room.type).toBe('Suite');
      expect(room.price).toBe(350);
      expect(room.capacity).toBe(4);
      expect(room.amenities).toContain('WiFi');
      expect(room.image).toBe('/test-images/room.jpg');
    });

    it('should accept overrides', () => {
      const room = createMockRoom({
        name: 'Custom Room',
        price: 500,
        amenities: ['Custom Amenity']
      });

      expect(room.name).toBe('Custom Room');
      expect(room.price).toBe(500);
      expect(room.amenities).toContain('Custom Amenity');
      expect(room.id).toBe('test-room-001'); // Should keep default
    });
  });

  describe('createMockBookingData', () => {
    it('should create booking data with default values', () => {
      const booking = createMockBookingData();

      expect(booking.checkIn).toBeInstanceOf(Date);
      expect(booking.checkOut).toBeInstanceOf(Date);
      expect(booking.adults).toBe(2);
      expect(booking.children).toBe(0);
      expect(booking.rooms).toBe(1);
    });

    it('should accept overrides', () => {
      const customDate = new Date('2025-12-01');
      const booking = createMockBookingData({
        checkIn: customDate,
        adults: 4,
        rooms: 2
      });

      expect(booking.checkIn).toBe(customDate);
      expect(booking.adults).toBe(4);
      expect(booking.rooms).toBe(2);
      expect(booking.children).toBe(0); // Should keep default
    });
  });

  describe('createMockHotel', () => {
    it('should create hotel data with default values', () => {
      const hotel = createMockHotel();

      expect(hotel.id).toBe('test-hotel-001');
      expect(hotel.name).toBe('The Sterling Executive');
      expect(hotel.rating).toBe(4.8);
      expect(hotel.amenities).toContain('Free WiFi');
      expect(hotel.contact.email).toBe('info@sterlingexecutive.com');
    });
  });

  describe('createMockHeroSection', () => {
    it('should create hero section data with default values', () => {
      const hero = createMockHeroSection();

      expect(hero.title).toBe('Welcome to The Sterling Executive');
      expect(hero.tagline).toBeTruthy();
      expect(hero.primaryCTA?.text).toBe('Book Now');
      expect(hero.variant).toEqual({
        style: 'modern',
        layout: 'centered',
        overlay: 'none',
        height: 'medium'
      });
    });

    it('should accept overrides', () => {
      const hero = createMockHeroSection({
        title: 'Custom Title',
        variant: { style: 'elegant', layout: 'split', overlay: 'dark', height: 'large' }
      });

      expect(hero.title).toBe('Custom Title');
      expect(hero.variant).toEqual({
        style: 'elegant',
        layout: 'split',
        overlay: 'dark',
        height: 'large'
      });
      expect(hero.primaryCTA?.text).toBe('Book Now'); // Should keep default
    });
  });

  describe('createMockNavigationItems', () => {
    it('should create navigation items with default values', () => {
      const items = createMockNavigationItems();

      expect(items).toHaveLength(5);
      expect(items[0].label).toBe('Home');
      expect(items[0].href).toBe('/');
      expect(items[1].label).toBe('Rooms');
      expect(items[4].label).toBe('Contact');
    });

    it('should accept overrides for specific items', () => {
      const items = createMockNavigationItems([
        { isActive: true },
        { label: 'Accommodations' }
      ]);

      expect(items[0].isActive).toBe(true);
      expect(items[1].label).toBe('Accommodations');
      expect(items.length).toBe(5);
    });
  });

  describe('createMockRoomList', () => {
    it('should create a list of rooms with default count', () => {
      const rooms = createMockRoomList();

      expect(rooms).toHaveLength(3);
      expect(rooms[0].name).toBe('Test Room 1');
      expect(rooms[1].name).toBe('Test Room 2');
      expect(rooms[2].name).toBe('Test Room 3');
    });

    it('should create a list with custom count', () => {
      const rooms = createMockRoomList(5);

      expect(rooms).toHaveLength(5);
      expect(rooms[0].name).toBe('Test Room 1');
      expect(rooms[4].name).toBe('Test Room 5');
    });

    it('should apply base overrides to all rooms', () => {
      const rooms = createMockRoomList(3, { type: 'Deluxe', price: 200 });

      rooms.forEach(room => {
        expect(room.type).toBe('Deluxe');
        expect(room.price).toBe(200);
      });
    });
  });

  describe('createMockTestimonial', () => {
    it('should create testimonial data with default values', () => {
      const testimonial = createMockTestimonial();

      expect(testimonial.id).toBe('testimonial-001');
      expect(testimonial.name).toBe('John Doe');
      expect(testimonial.rating).toBe(5);
      expect(testimonial.comment).toBeTruthy();
    });
  });

  describe('createMockContactForm', () => {
    it('should create contact form data with default values', () => {
      const form = createMockContactForm();

      expect(form.name).toBe('Jane Smith');
      expect(form.email).toBe('jane.smith@example.com');
      expect(form.subject).toBe('General Inquiry');
      expect(form.message).toBeTruthy();
    });
  });
});