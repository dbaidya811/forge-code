import ora, { Ora } from 'ora';
import { theme } from './theme.js';

let activeSpinner: Ora | null = null;

export const spinner = {
  // Start a new spinner with Claude-inspired warm styling
  start(text: string): Ora {
    if (activeSpinner) {
      activeSpinner.stop();
    }

    activeSpinner = ora({
      text: theme.dim(text),
      color: 'yellow',
      spinner: 'dots'
    }).start();

    return activeSpinner;
  },

  // Update existing spinner text dynamically during tool runs or reasoning
  update(text: string): void {
    if (activeSpinner) {
      activeSpinner.text = theme.dim(text);
    }
  },

  // Stop spinner with success indicator
  succeed(text?: string): void {
    if (activeSpinner) {
      activeSpinner.succeed(text ? theme.success(text) : undefined);
      activeSpinner = null;
    }
  },

  // Stop spinner with failure indicator
  fail(text?: string): void {
    if (activeSpinner) {
      activeSpinner.fail(text ? theme.error(text) : undefined);
      activeSpinner = null;
    }
  },

  // Gracefully stop spinner without status icons
  stop(): void {
    if (activeSpinner) {
      activeSpinner.stop();
      activeSpinner = null;
    }
  }
};