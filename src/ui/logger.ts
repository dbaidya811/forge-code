import { theme } from './theme.js';

export const logger = {
  step(msg: string): void {
    console.log(`${theme.terracotta(theme.symbols.pointer)} ${theme.bold(msg)}`);
  },
  success(msg: string): void {
    console.log(`${theme.success(theme.symbols.success)} ${msg}`);
  },
  error(msg: string): void {
    console.log(`${theme.error(theme.symbols.cross)} ${msg}`);
  },
  info(msg: string): void {
    console.log(`${theme.muted(theme.symbols.bullet)} ${msg}`);
  },
  action(action: string, detail: string): void {
    console.log(`  ${theme.terracottaBright(action)} ${theme.dim(detail)}`);
  },
  modelBadge(modelName: string, mode: string): void {
    console.log(`${theme.muted('[' + mode.toUpperCase() + ']')} Active Model: ${theme.terracotta(modelName)}\n`);
  }
};