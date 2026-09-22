import { test, expect, type Page } from '@playwright/test';

const routes = [
  ['/', 'Fleet overview'],
  ['/vehicles', 'Vehicles'],
  ['/devices', 'Devices'],
  ['/esg', 'ESG Savings Calculator'],
  ['/alerts', 'Alerts'],
  ['/geofences', 'Geofences'],
  ['/firmware', 'Firmware'],
  ['/admins', 'Admin Management'],
  ['/notifications', 'Notifications Center'],
  ['/settings', 'Settings'],
  ['/profile', 'Profile'],
] as const;

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('name@company.com').fill('admin@electrie.io');
  await page.getByPlaceholder('Enter password').fill('admin2026pass');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/');
}

test('signs in with the demo account', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('fc_auth', 'false'));
  await page.goto('/login');

  await expect(page.getByText('Fleet Telemetry & Operations')).toBeVisible();
  await page.getByPlaceholder('name@company.com').fill('admin@electrie.io');
  await page.getByPlaceholder('Enter password').fill('admin2026pass');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('Fleet overview')).toBeVisible();
});

test('validates login utilities and password recovery', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('fc_auth', 'false'));
  await page.goto('/login');

  const password = page.getByPlaceholder('Enter password');
  await expect(password).toHaveAttribute('type', 'password');
  await password.fill('secret');
  await password.locator('xpath=..').getByRole('button').click();
  await expect(password).toHaveAttribute('type', 'text');

  await page.getByRole('button', { name: 'Forgot password?' }).click();
  await expect(page.getByText('Reset Password')).toBeVisible();
  await page.getByPlaceholder('admin@company.com').fill('admin@electrie.io');
  await page.getByRole('button', { name: 'Send Link' }).click();
  await expect(page.getByText('Link Sent!')).toBeVisible();
  await page.waitForTimeout(1600);
  await expect(page.getByText('Reset Password')).not.toBeVisible();
});

test.describe('authenticated pages', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('loads every application page from its route', async ({ page }) => {
    for (const [route, heading] of routes) {
      await page.goto(route);
      await expect(page.getByText(heading, { exact: true }).first()).toBeVisible();
    }
  });

  test('navigates through the sidebar and signs out', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Sidebar Links' });
    const sidebarShell = page.getByRole('complementary', { name: 'Main Sidebar Navigation' });
    for (const [route, label] of routes.slice(1, 9)) {
      await sidebar.getByRole('link', { name: new RegExp(`^${label.split(' ')[0]}`) }).click();
      await expect(page).toHaveURL(route);
    }
    await sidebarShell.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
    await sidebarShell.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByText('Fleet Telemetry & Operations')).toBeVisible();
  });

  test('filters the dashboard, opens the map, refreshes it, and searches globally', async ({ page }) => {
    await expect(page.getByText('Fleet overview')).toBeVisible();
    await page.getByRole('button', { name: 'Filter map by vehicle status' }).click();
    await page.getByRole('button', { name: 'Online', exact: true }).last().click();
    await expect(page.getByText(/\d+ \/ \d+ Active/)).toBeVisible();

    await page.getByRole('button', { name: 'View map in full screen mode' }).click();
    await expect(page.getByText('Fleet Tracking Map — Full View')).toBeVisible();
    await page.getByRole('button', { name: 'Exit Full Screen' }).click();
    await expect(page.getByText('Fleet Tracking Map — Full View')).not.toBeVisible();

    const search = page.getByRole('textbox', { name: 'Global search across vehicles, plates, IMEIs, pages, alerts' });
    await search.fill('Vehicles');
    await expect(page.getByText('Navigation & Pages', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(search).toHaveValue('');
  });

  test('adds a vehicle, exports data, and opens and closes vehicle details', async ({ page }) => {
    await page.goto('/vehicles');
    await page.getByRole('button', { name: 'Add Vehicle' }).click();
    await expect(page.getByText('Add New Vehicle')).toBeVisible();
    await page.getByPlaceholder('e.g. Courier 21').fill('QA Courier');
    await page.getByPlaceholder('e.g. DL3C AY 9982').fill('QA 1234');
    await page.getByPlaceholder('e.g. Mahindra eSupro').fill('QA Model');
    await page.getByPlaceholder('e.g. Amit Sen').fill('QA Driver');
    await page.getByRole('button', { name: 'Register Vehicle' }).click();
    await expect(page.getByText('QA Courier', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Export Data' }).click();
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export CSV' }).click();
    await expect(download).resolves.toBeTruthy();

    await page.getByRole('row', { name: /QA Courier.*online/i }).click();
    await expect(page.getByLabel('Vehicle Details & Controls')).toBeVisible();
    await page.getByRole('button', { name: 'Close drawer' }).click();
    await expect(page.getByLabel('Vehicle Details & Controls')).toHaveClass(/translate-x-full/);
  });

  test('manages notifications and opens profile and settings from the topbar', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByText('Actionable Alerts')).toBeVisible();
    await page.getByRole('button', { name: 'unread', exact: true }).click();
    await expect(page.getByText('Unread').first()).toBeVisible();
    await page.getByRole('button', { name: 'Mark all read' }).click();
    await expect(page.getByRole('button', { name: 'Mark all read' })).not.toBeVisible();

    await page.getByRole('button', { name: 'View user profile' }).click();
    await expect(page).toHaveURL('/profile');
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page).toHaveURL('/settings');
  });
});
