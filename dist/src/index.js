import * as p from '@clack/prompts';
import { renderSecurityNotesOnly, renderBigBanner, waitForEnter } from './ui/banner.js';
import { promptApiKey, promptRoutingMode, promptSearchModel } from './ui/prompts.js';
import { OpenRouterService } from './core/openrouter-client.js';
import { ModelRouter } from './core/model-router.js';
import { AgentExecutionLoop } from './core/agent.js';
import { logger } from './ui/logger.js';
import { theme } from './ui/theme.js';
// Minimal 1-line status bar for continuous conversation turns
function renderTurnStats(agent, mode) {
    const lastTokens = `${agent.tokens.lastTotalTokens.toLocaleString()} tk`;
    const totalTokens = `${agent.tokens.sessionTotalTokens.toLocaleString()} tk`;
    const bar = [
        `${theme.muted('Model:')} ${theme.terracotta(agent.getActiveModel())}`,
        `${theme.muted('Mode:')} ${theme.white(mode)}`,
        `${theme.muted('Last Run:')} ${theme.info(lastTokens)}`,
        `${theme.muted('Total Session:')} ${theme.success(totalTokens)}`
    ].join(` ${theme.dim('│')} `);
    console.log(`\n${bar}\n`);
}
export async function startApp() {
    console.clear();
    // 1. First Screen: Security preview notes
    renderSecurityNotesOnly();
    await waitForEnter();
    console.clear();
    // 2. Authenticate
    const apiKey = await promptApiKey();
    const service = new OpenRouterService(apiKey);
    console.clear();
    // 3. Selection Screen with Big Banner (Once on startup)
    renderBigBanner();
    let currentSelection = await promptRoutingMode(service);
    const router = new ModelRouter(service);
    let candidates = await router.resolveCandidateModels(currentSelection.mode, currentSelection.manualModelId);
    if (candidates.length === 0) {
        logger.error('No candidate models found.');
        process.exit(1);
    }
    const agent = new AgentExecutionLoop(service, candidates);
    // Show shortcut hints once at startup
    console.log(`${theme.dim('Commands:')} ${theme.terracotta('/model')} ${theme.dim('· switch model')} ${theme.dim('│')} ${theme.terracotta('/mode')} ${theme.dim('· switch mode')} ${theme.dim('│')} ${theme.terracotta('/clear')} ${theme.dim('│')} ${theme.terracotta('exit')}\n`);
    let isFirstTurn = true;
    // 4. Main Continuous Conversation Loop
    while (true) {
        // Show token stats only after at least 1 turn has run
        if (!isFirstTurn) {
            renderTurnStats(agent, currentSelection.mode);
        }
        const rawInput = await p.text({
            message: `${theme.terracotta('forge')} ${theme.dim('❯')}`,
            placeholder: 'Ask to code, inspect files, or type /model, exit...'
        });
        if (p.isCancel(rawInput)) {
            p.outro(theme.muted(`Session closed. Total tokens: ${agent.tokens.sessionTotalTokens.toLocaleString()}`));
            process.exit(0);
        }
        const input = rawInput.trim();
        const command = input.toLowerCase();
        // Strict exit
        if (command === 'exit' || command === '/exit' || command === 'quit' || command === ':q') {
            p.outro(theme.muted(`Session ended. Total tokens used: ${agent.tokens.sessionTotalTokens.toLocaleString()}`));
            process.exit(0);
        }
        // Manual screen refresh (redraws big banner)
        if (command === '/clear' || command === 'clear') {
            console.clear();
            renderBigBanner();
            console.log(`${theme.dim('Commands:')} ${theme.terracotta('/model')} ${theme.dim('│')} ${theme.terracotta('/mode')} ${theme.dim('│')} ${theme.terracotta('/clear')} ${theme.dim('│')} ${theme.terracotta('exit')}\n`);
            isFirstTurn = true;
            continue;
        }
        // Switch model
        if (command === '/model') {
            const chosenModel = await promptSearchModel(service);
            agent.setModel(chosenModel);
            currentSelection.mode = 'manual';
            p.note(theme.success(`Active model changed to: ${chosenModel}`));
            continue;
        }
        // Switch mode
        if (command === '/mode') {
            currentSelection = await promptRoutingMode(service);
            candidates = await router.resolveCandidateModels(currentSelection.mode, currentSelection.manualModelId);
            agent.setModel(candidates[0]);
            p.note(theme.success(`Mode changed to: ${currentSelection.mode}`));
            continue;
        }
        // Execute task
        if (input.length > 0) {
            await agent.runTask(input);
            isFirstTurn = false;
            console.log(theme.dim('─'.repeat(50)));
        }
    }
}
