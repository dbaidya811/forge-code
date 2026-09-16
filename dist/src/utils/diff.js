import { theme } from '../ui/theme.js';
export const diffUtils = {
    // Generate unified line-by-line diff between original and modified text
    computeDiff(oldText, newText) {
        const oldLines = oldText.split(/\r?\n/);
        const newLines = newText.split(/\r?\n/);
        const diff = [];
        let i = 0;
        let j = 0;
        while (i < oldLines.length || j < newLines.length) {
            if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
                diff.push({ type: 'unchanged', content: oldLines[i] });
                i++;
                j++;
            }
            else if (j < newLines.length && (!oldLines.includes(newLines[j], i) || i >= oldLines.length)) {
                diff.push({ type: 'added', content: newLines[j] });
                j++;
            }
            else if (i < oldLines.length) {
                diff.push({ type: 'removed', content: oldLines[i] });
                i++;
            }
        }
        return diff;
    },
    // Format and render styled visual diff output in terminal
    renderDiff(filePath, oldText, newText) {
        const diffLines = this.computeDiff(oldText, newText);
        console.log(`\n${theme.dim('--- a/' + filePath)}`);
        console.log(`${theme.dim('+++ b/' + filePath)}`);
        for (const line of diffLines) {
            if (line.type === 'added') {
                console.log(theme.success(`+ ${line.content}`));
            }
            else if (line.type === 'removed') {
                console.log(theme.error(`- ${line.content}`));
            }
            else {
                console.log(theme.dim(`  ${line.content}`));
            }
        }
        console.log();
    }
};
