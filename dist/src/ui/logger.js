import { theme } from './theme.js';
export const logger = {
    step(msg) {
        console.log(`${theme.terracotta(theme.symbols.pointer)} ${theme.bold(msg)}`);
    },
    success(msg) {
        console.log(`${theme.success(theme.symbols.success)} ${msg}`);
    },
    error(msg) {
        console.log(`${theme.error(theme.symbols.cross)} ${msg}`);
    },
    info(msg) {
        console.log(`${theme.muted(theme.symbols.bullet)} ${msg}`);
    },
    action(action, detail) {
        console.log(`  ${theme.terracottaBright(action)} ${theme.dim(detail)}`);
    },
    modelBadge(modelName, mode) {
        console.log(`${theme.muted('[' + mode.toUpperCase() + ']')} Active Model: ${theme.terracotta(modelName)}\n`);
    }
};
