#!/usr/bin/env node

import { Command } from 'commander';
import { startApp } from '../src/index.js';

const program = new Command();

program
  .name('forge')
  .description('Autonomous OpenRouter-driven terminal coding agent')
  .version('1.0.0')
  .action(async () => {
    try {
      await startApp();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`Fatal error: ${errorMsg}`);
      process.exit(1);
    }
  });

program.parse(process.argv);