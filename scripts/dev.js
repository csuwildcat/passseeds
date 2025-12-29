#!/usr/bin/env node

/**
 * Dev runner: TypeScript watch, with optional demo server + live reload.
 * Run with: npm run dev [-- --demo]
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const withDemo = args.includes('--demo') || args.includes('-d');

const processes = new Set();

function startProcess(command, commandArgs, options = {}) {
  const child = spawn(command, commandArgs, {
    stdio: 'inherit',
    ...options
  });

  processes.add(child);

  child.on('exit', (code, signal) => {
    processes.delete(child);
    if (signal) {
      return;
    }
    if (code && code !== 0) {
      shutdown(code);
      return;
    }
    if (processes.size === 0) {
      process.exit(0);
    }
  });

  return child;
}

function shutdown(code = 0) {
  for (const child of processes) {
    child.kill('SIGINT');
  }
  setTimeout(() => process.exit(code), 250);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

const tscArgs = withDemo ? ['--watch', '--noEmit'] : ['--watch'];
startProcess('tsc', tscArgs);

if (withDemo) {
  const demoScript = path.join(__dirname, 'serve-demo.js');
  startProcess(process.execPath, [demoScript], {
    env: process.env
  });
}
