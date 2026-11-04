import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const destination = resolve('dist');
await stat('.next/standalone/server.js');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp('.next/standalone', destination, { recursive: true });
await cp('.next/static', resolve(destination, '.next/static'), { recursive: true });
await cp('public', resolve(destination, 'public'), { recursive: true });
await cp('ecosystem.config.cjs', resolve(destination, 'ecosystem.config.cjs'));
console.log('Packaged the Next.js standalone server, client assets and public files in dist.');
