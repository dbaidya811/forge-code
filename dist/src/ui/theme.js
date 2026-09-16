import chalk from 'chalk';
// Claude Code aesthetic palette: Warm terracotta accent, muted slate borders, crisp monochrome text
export const theme = {
    terracotta: chalk.hex('#D97706'),
    terracottaBright: chalk.hex('#F59E0B'),
    muted: chalk.hex('#6B7280'),
    dim: chalk.hex('#4B5563'),
    success: chalk.hex('#10B981'),
    error: chalk.hex('#EF4444'),
    info: chalk.hex('#3B82F6'),
    bold: chalk.bold,
    white: chalk.white,
    // CLI Symbols
    symbols: {
        pointer: '❯',
        bullet: '●',
        success: '✔',
        cross: '✖',
        sparkle: '✢',
        gear: '⚙'
    }
};
