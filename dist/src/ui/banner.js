import boxen from 'boxen';
import chalk from 'chalk';
import readline from 'readline';
export const claudeColors = {
    terracotta: chalk.hex('#DA7756'),
    border: '#DA7756',
    white: chalk.white,
    bold: chalk.bold,
    mutedText: chalk.hex('#D1D5DB'),
    dimText: chalk.hex('#9CA3AF'),
    linkBlue: chalk.hex('#6366F1')
};
// Screenshot's exact large pixel ASCII art font
const BIG_FORGE_CODE = `
███████╗  ██████╗  ██████╗   ██████╗  ███████╗
██╔════╝ ██╔═══██╗ ██╔══██╗ ██╔════╝  ██╔════╝
█████╗   ██║   ██║ ██████╔╝ ██║  ███╗ █████╗  
██╔══╝   ██║   ██║ ██╔══██╗ ██║   ██║ ██╔══╝  
██║      ╚██████╔╝ ██║  ██║ ╚██████╔╝ ███████╗
╚═╝       ╚═════╝  ╚═╝  ╚═╝  ╚═════╝  ╚══════╝
 ██████╗   ██████╗  ██████╗   ███████╗
██╔════╝  ██╔═══██╗ ██╔══██╗  ██╔════╝
██║       ██║   ██║ ██║  ██║  █████╗  
██║       ██║   ██║ ██╔══██╗  ██╔══╝  
╚██████╗  ╚██████╔╝ ██████╔╝  ███████╗
 ╚═════╝   ╚═════╝  ╚═════╝   ╚══════╝`.trimStart();
export function renderWelcomePill() {
    const pillContent = `${claudeColors.terracotta('✻')} Welcome to ${claudeColors.bold(claudeColors.white('Forge Code'))} research preview!`;
    console.log(boxen(pillContent, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 1, bottom: 1, left: 0, right: 0 },
        borderColor: claudeColors.border,
        borderStyle: 'round'
    }));
}
// 1st Screen: Exact image view (Pill box + Security notes, NO big banner)
export function renderSecurityNotesOnly() {
    renderWelcomePill();
    console.log(`${claudeColors.bold(claudeColors.white('Security notes:'))}\n`);
    const notes = [
        {
            title: '1. Forge Code is currently in research preview',
            desc: '   This tool executes real-time code and terminal operations autonomously.\n   Review tasks before confirming execution.'
        },
        {
            title: '2. Models can make mistakes',
            desc: '   Always inspect agent responses and file edits carefully, especially\n   when running terminal shell commands.'
        },
        {
            title: '3. Due to prompt injection risks, only use it with code you trust',
            desc: `   Powered by OpenRouter intelligent model fallback router.\n   Documentation & issues: https://openrouter.ai`
        }
    ];
    for (const n of notes) {
        console.log(`${claudeColors.mutedText(n.title)}`);
        console.log(`${claudeColors.dimText(n.desc)}\n`);
    }
}
// 2nd Screen onwards: Big ASCII Banner
export function renderBigBanner() {
    renderWelcomePill();
    console.log(claudeColors.terracotta(BIG_FORGE_CODE));
    console.log();
}
export async function waitForEnter() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(claudeColors.linkBlue('Press Enter to continue... '), () => {
            rl.close();
            resolve();
        });
    });
}
