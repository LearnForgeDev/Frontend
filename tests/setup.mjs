import { JSDOM } from 'jsdom';

const storage = new JSDOM('', { url: 'http://localhost' }).window.localStorage;
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
