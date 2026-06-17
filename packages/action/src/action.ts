import * as core from '@actions/core';
import { run } from './run.js';

// Node 21+ provides globalThis.navigator as a read-only getter.
// Only set it if it doesn't already exist (older Node versions).
if (typeof globalThis.navigator === 'undefined') {
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'node.js' },
    writable: true,
    configurable: true,
  });
}

run().catch(e => {
  core.setFailed(e.message || e);
});
