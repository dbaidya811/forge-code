import Conf from 'conf';
// Persists config in system configuration path (~/.config/forge-code on Unix or AppData on Windows)
const store = new Conf({
    projectName: 'forge-code'
});
export const keyStore = {
    getApiKey() {
        return process.env.OPENROUTER_API_KEY || store.get('apiKey');
    },
    setApiKey(key) {
        store.set('apiKey', key.trim());
    },
    clearApiKey() {
        store.delete('apiKey');
    },
    getPreferredMode() {
        return store.get('defaultMode') || 'auto_free';
    },
    setPreferredMode(mode) {
        store.set('defaultMode', mode);
    }
};
