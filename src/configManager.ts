import * as vscode from 'vscode';

export class ConfigManager {
    private readonly configSection = 'smartTerminal';

    /**
     * Gets the default terminal setting
     */
    getDefaultTerminal(): string {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get<string>('defaultTerminal', 'PowerShell');
    }

    /**
     * Sets the default terminal
     */
    async setDefaultTerminal(terminal: string): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        await config.update('defaultTerminal', terminal, vscode.ConfigurationTarget.Global);
    }

    /**
     * Gets auto-detect on startup setting
     */
    getAutoDetectOnStartup(): boolean {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get<boolean>('autoDetectOnStartup', true);
    }

    /**
     * Sets auto-detect on startup
     */
    async setAutoDetectOnStartup(enabled: boolean): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        await config.update('autoDetectOnStartup', enabled, vscode.ConfigurationTarget.Global);
    }

    /**
     * Gets statistics collection setting
     */
    getEnableStatistics(): boolean {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get<boolean>('enableStatistics', false);
    }

    /**
     * Sets statistics collection
     */
    async setEnableStatistics(enabled: boolean): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        await config.update('enableStatistics', enabled, vscode.ConfigurationTarget.Global);
    }

    /**
     * Gets show recommendations setting
     */
    getShowRecommendations(): boolean {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get<boolean>('showRecommendations', true);
    }

    /**
     * Sets show recommendations
     */
    async setShowRecommendations(enabled: boolean): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        await config.update('showRecommendations', enabled, vscode.ConfigurationTarget.Global);
    }

    /**
     * Gets terminal priority for a specific command type
     */
    getTerminalPriority(commandType: string): string | undefined {
        const config = vscode.workspace.getConfiguration(this.configSection);
        const priorities = config.get<Record<string, string>>('terminalPriority', {});
        return priorities[commandType];
    }

    /**
     * Gets all terminal priorities
     */
    getAllTerminalPriorities(): Record<string, string> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get<Record<string, string>>('terminalPriority', {
            npm: 'PowerShell',
            node: 'PowerShell',
            yarn: 'PowerShell',
            pnpm: 'PowerShell',
            git: 'Git Bash',
            python: 'CMD',
            pip: 'CMD',
            docker: 'PowerShell',
            kubectl: 'PowerShell',
            bash: 'Git Bash',
            sh: 'Git Bash',
            wsl: 'WSL',
            linux: 'WSL'
        });
    }

    /**
     * Sets terminal priority for a specific command type
     */
    async setTerminalPriority(commandType: string, terminal: string): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        const priorities = this.getAllTerminalPriorities();
        priorities[commandType] = terminal;
        await config.update('terminalPriority', priorities, vscode.ConfigurationTarget.Global);
    }

    /**
     * Gets custom terminals
     */
    getCustomTerminals(): Array<{ name: string; path: string; args?: string[] }> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get<Array<{ name: string; path: string; args?: string[] }>>('customTerminals', []);
    }

    /**
     * Adds a custom terminal
     */
    async addCustomTerminal(name: string, path: string, args?: string[]): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        const customTerminals = this.getCustomTerminals();
        customTerminals.push({ name, path, args });
        await config.update('customTerminals', customTerminals, vscode.ConfigurationTarget.Global);
    }

    /**
     * Removes a custom terminal
     */
    async removeCustomTerminal(name: string): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        const customTerminals = this.getCustomTerminals();
        const filtered = customTerminals.filter(t => t.name !== name);
        await config.update('customTerminals', filtered, vscode.ConfigurationTarget.Global);
    }

    /**
     * Gets AutoRun confirmation setting
     */
    getAutoRunConfirmation(): boolean {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get<boolean>('autoRunConfirmation', true);
    }

    /**
     * Sets AutoRun confirmation
     */
    async setAutoRunConfirmation(enabled: boolean): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        await config.update('autoRunConfirmation', enabled, vscode.ConfigurationTarget.Global);
    }

    /**
     * Gets all configuration as an object
     */
    getAllConfig(): any {
        return {
            defaultTerminal: this.getDefaultTerminal(),
            autoDetectOnStartup: this.getAutoDetectOnStartup(),
            enableStatistics: this.getEnableStatistics(),
            showRecommendations: this.getShowRecommendations(),
            terminalPriority: this.getAllTerminalPriorities(),
            customTerminals: this.getCustomTerminals(),
            autoRunConfirmation: this.getAutoRunConfirmation()
        };
    }

    /**
     * Resets all configuration to defaults
     */
    async resetToDefaults(): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        await config.update('defaultTerminal', undefined, vscode.ConfigurationTarget.Global);
        await config.update('autoDetectOnStartup', undefined, vscode.ConfigurationTarget.Global);
        await config.update('enableStatistics', undefined, vscode.ConfigurationTarget.Global);
        await config.update('showRecommendations', undefined, vscode.ConfigurationTarget.Global);
        await config.update('terminalPriority', undefined, vscode.ConfigurationTarget.Global);
        await config.update('customTerminals', undefined, vscode.ConfigurationTarget.Global);
        await config.update('autoRunConfirmation', undefined, vscode.ConfigurationTarget.Global);
    }

    /**
     * Exports configuration to JSON
     */
    exportConfig(): string {
        return JSON.stringify(this.getAllConfig(), null, 2);
    }

    /**
     * Imports configuration from JSON
     */
    async importConfig(jsonConfig: string): Promise<void> {
        try {
            const config = JSON.parse(jsonConfig);
            const vsConfig = vscode.workspace.getConfiguration(this.configSection);

            if (config.defaultTerminal) {
                await vsConfig.update('defaultTerminal', config.defaultTerminal, vscode.ConfigurationTarget.Global);
            }
            if (config.autoDetectOnStartup !== undefined) {
                await vsConfig.update('autoDetectOnStartup', config.autoDetectOnStartup, vscode.ConfigurationTarget.Global);
            }
            if (config.enableStatistics !== undefined) {
                await vsConfig.update('enableStatistics', config.enableStatistics, vscode.ConfigurationTarget.Global);
            }
            if (config.showRecommendations !== undefined) {
                await vsConfig.update('showRecommendations', config.showRecommendations, vscode.ConfigurationTarget.Global);
            }
            if (config.terminalPriority) {
                await vsConfig.update('terminalPriority', config.terminalPriority, vscode.ConfigurationTarget.Global);
            }
            if (config.customTerminals) {
                await vsConfig.update('customTerminals', config.customTerminals, vscode.ConfigurationTarget.Global);
            }
            if (config.autoRunConfirmation !== undefined) {
                await vsConfig.update('autoRunConfirmation', config.autoRunConfirmation, vscode.ConfigurationTarget.Global);
            }
        } catch (error) {
            throw new Error('Invalid configuration JSON');
        }
    }
}
