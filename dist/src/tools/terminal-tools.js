import { execa } from 'execa';
export const terminalTools = {
    async runCommand(command) {
        try {
            // Execute shell command in the active working directory
            const { stdout, stderr } = await execa(command, {
                shell: true,
                cwd: process.cwd(),
                reject: false
            });
            const output = [stdout, stderr].filter(Boolean).join('\n');
            return output.trim() || '(Command completed with no standard output)';
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return `Execution error: ${message}`;
        }
    }
};
