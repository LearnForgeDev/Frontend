import { afterEach, describe, expect, it, vi } from 'vitest';
import nextConfig from '../../next.config';

afterEach(() => vi.unstubAllEnvs());

describe('homework backend forwarding', () => {
  it('forwards homework realtime requests through the configured backend origin', async () => {
    vi.stubEnv('CI_BACKEND_URL', 'http://127.0.0.1:8080/');
    expect(await nextConfig.rewrites?.()).toContainEqual({ source: '/homeworkHub/:path*', destination: 'http://127.0.0.1:8080/homeworkHub/:path*' });
  });

  it('does not invent a backend target when none is configured', async () => {
    vi.stubEnv('CI_BACKEND_URL', '');
    vi.stubEnv('BACKEND_URL', '');
    expect(await nextConfig.rewrites?.()).toEqual([]);
  });
});
