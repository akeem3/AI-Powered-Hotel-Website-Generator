import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

import Navbar from '@/components/ui/Navbar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href, onClick, ...props }: any) {
    return (
      <a href={href} onClick={onClick} {...props}>
        {children}
      </a>
    );
  };
});

expect.extend(toHaveNoViolations);

const mockUsePathname = jest.requireMock('next/navigation').usePathname;
const mockUseRouter = jest.requireMock('next/navigation').useRouter;

const renderNavbarAt = (path: string) => {
  mockUsePathname.mockReturnValue(path);
  return render(<Navbar />);
};

const getPrimaryNav = () =>
  screen.getByRole('navigation', { name: /primary site navigation/i });

const getDesktopNavItem = (label: RegExp | string) =>
  within(getPrimaryNav()).getByRole('link', {
    name: typeof label === 'string' ? new RegExp(label, 'i') : label,
  });

const getMenuButton = () => screen.getByRole('button', { name: /menu/i });

describe('Navbar integration', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('highlights the active route for top-level navigation items', () => {
    const cases: Array<{ path: string; active: string }> = [
      { path: '/', active: 'Home' },
      { path: '/rooms', active: 'Rooms' },
      { path: '/contact', active: 'Contact' },
    ];

    cases.forEach(({ path, active }) => {
      renderNavbarAt(path);

      const nav = getPrimaryNav();
      const navList = within(nav).getByRole('list', { name: /primary navigation links/i });
      const home = within(navList).getByRole('link', { name: /^home$/i });
      const rooms = within(navList).getByRole('link', { name: /^rooms$/i });
      const contact = within(navList).getByRole('link', { name: /^contact$/i });

      const mapping = {
        Home: home,
        Rooms: rooms,
        Contact: contact,
      } as const;

      Object.entries(mapping).forEach(([label, element]) => {
        if (label === active) {
          expect(element).toHaveAttribute('aria-current', 'page');
          // Story 1.11: Updated to semantic tokens - active state uses underline + font-semibold
          expect(element).toHaveClass('font-semibold');
        } else {
          expect(element).not.toHaveAttribute('aria-current', 'page');
        }
      });

      cleanup();
    });
  });

  it('opens the mobile menu and closes it after selecting a link', async () => {
    const user = userEvent.setup();
    renderNavbarAt('/');

    const menuButton = getMenuButton();
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    const mobileMenu = screen.getByRole('dialog', { name: /mobile navigation/i });
    const roomsLink = within(mobileMenu).getByRole('link', { name: /rooms/i });
    await user.click(roomsLink);

    expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(roomsLink).toHaveAttribute('href', '/rooms');
  });

  it('links the brand logo back to the homepage', async () => {
    const user = userEvent.setup();
    renderNavbarAt('/rooms');

    const logoLink = within(getPrimaryNav()).getAllByRole('link', {
      name: /sterling executive/i,
    })[0];

    expect(logoLink).toHaveAttribute('href', '/');
    await user.click(logoLink);
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('keeps core interactions accessible', async () => {
    const user = userEvent.setup();
    renderNavbarAt('/');

    const menuButton = getMenuButton();
    menuButton.focus();
    expect(menuButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('passes basic axe accessibility checks', async () => {
    const { container } = renderNavbarAt('/');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

