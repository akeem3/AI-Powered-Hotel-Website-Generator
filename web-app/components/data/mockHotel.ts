import type { HeroSectionProps } from '@/types/hero';

export const mockHotelData: HeroSectionProps = {
  title: 'The Sterling Executive',
  tagline: 'Where Business Meets Boutique Excellence',
  subtitle: 'A refined stay tailored for the modern professional.', // ✅ added
  headline:
    'Experience bespoke service, quiet workspaces, and luxurious rooms in the heart of the business district.',
  description:
    'Experience the perfect blend of corporate efficiency and boutique luxury in the heart of the business district.',
  primaryCTA: {
    text: 'View Rooms',
    href: '/rooms',
  },
  secondaryCTA: {
    text: 'Contact Us',
    href: '/contact',
  },
  background: 'solid',
};
