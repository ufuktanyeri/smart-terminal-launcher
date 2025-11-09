import * as vscode from 'vscode';
import { Terminal } from './terminalDetector';

export class TerminalLauncher {
    private activeTerminals: Map<string, vscode.Terminal> = new Map();

    /**
     * Runs a command in the specified terminal
     */
    async runCommand(command: string, terminal: Terminal): Promise<void> {
        const vsTerminal = this.getOrCreateTerminal(terminal);
        
        // Show the terminal
        vsTerminal.show(true);
        
        // Send the command
        vsTerminal.sendText(command, true);
    }

    /**
     * Gets an existing terminal or creates a new one
     */
    private getOrCreateTerminal(terminal: Terminal): vscode.Terminal {
        const terminalKey = `${terminal.name}-${terminal.type}`;
        
        // Check if terminal already exists and is still active
        let vsTerminal = this.activeTerminals.get(terminalKey);
        
        if (vsTerminal && this.isTerminalActive(vsTerminal)) {
            return vsTerminal;
        }

        // Create new terminal
        vsTerminal = this.createTerminal(terminal);
        this.activeTerminals.set(terminalKey, vsTerminal);
        
        return vsTerminal;
    }

    /**
     * Creates a new VS Code terminal
     */
    private createTerminal(terminal: Terminal): vscode.Terminal {
        const options: vscode.TerminalOptions = {
            name: `Smart Terminal: ${terminal.name}`,
            shellPath: terminal.path,
            iconPath: new vscode.ThemeIcon(terminal.icon)
        };

        // Add shell args if needed
        if (terminal.type === 'powershell') {
            options.shellArgs = ['-NoLogo'];
        } else if (terminal.type === 'gitbash') {
            options.shellArgs = ['--login'];
        }

        return vscode.window.createTerminal(options);
    }

    /**
     * Checks if a terminal is still active
     */
    private isTerminalActive(terminal: vscode.Terminal): boolean {
        return vscode.window.terminals.includes(terminal);
    }

    /**
     * Runs a command in a new terminal (always creates new)
     */
    async runCommandInNewTerminal(command: string, terminal: Terminal): Promise<void> {
        const vsTerminal = this.createTerminal(terminal);
        vsTerminal.show(true);
        vsTerminal.sendText(command, true);
    }

    /**
     * Runs multiple commands sequentially in the same terminal
     */
    async runCommandsSequentially(commands: string[], terminal: Terminal): Promise<void> {
        const vsTerminal = this.getOrCreateTerminal(terminal);
        vsTerminal.show(true);
        
        for (const command of commands) {
            vsTerminal.sendText(command, true);
            // Wait a bit between commands
            await this.sleep(100);
        }
    }

    /**
     * Runs the same command in multiple terminals simultaneously
     */
    async runCommandInMultipleTerminals(command: string, terminals: Terminal[]): Promise<void> {
        const promises = terminals.map(terminal => this.runCommand(command, terminal));
        await Promise.all(promises);
    }

    /**
     * Clears a terminal
     */
    clearTerminal(terminal: Terminal): void {
        const terminalKey = `${terminal.name}-${terminal.type}`;
        const vsTerminal = this.activeTerminals.get(terminalKey);
        
        if (vsTerminal && this.isTerminalActive(vsTerminal)) {
            // Send clear command based on terminal type
            if (terminal.type === 'cmd') {
                vsTerminal.sendText('cls', true);
            } else {
                vsTerminal.sendText('clear', true);
            }
        }
    }

    /**
     * Closes a terminal
     */
    closeTerminal(terminal: Terminal): void {
        const terminalKey = `${terminal.name}-${terminal.type}`;
        const vsTerminal = this.activeTerminals.get(terminalKey);
        
        if (vsTerminal && this.isTerminalActive(vsTerminal)) {
            vsTerminal.dispose();
            this.activeTerminals.delete(terminalKey);
        }
    }

    /**
     * Closes all managed terminals
     */
    closeAllTerminals(): void {
        for (const [key, terminal] of this.activeTerminals.entries()) {
            if (this.isTerminalActive(terminal)) {
                terminal.dispose();
            }
        }
        this.activeTerminals.clear();
    }

    /**
     * Gets all active terminals
     */
    getActiveTerminals(): vscode.Terminal[] {
        const activeTerminals: vscode.Terminal[] = [];
        
        for (const [key, terminal] of this.activeTerminals.entries()) {
            if (this.isTerminalActive(terminal)) {
                activeTerminals.push(terminal);
            } else {
                // Clean up inactive terminals
                this.activeTerminals.delete(key);
            }
        }
        
        return activeTerminals;
    }

    /**
     * Focuses on a specific terminal
     */
    focusTerminal(terminal: Terminal): void {
        const terminalKey = `${terminal.name}-${terminal.type}`;
        const vsTerminal = this.activeTerminals.get(terminalKey);
        
        if (vsTerminal && this.isTerminalActive(vsTerminal)) {
            vsTerminal.show(true);
        }
    }

    /**
     * Sends text to terminal without executing (no enter)
     */
    sendTextToTerminal(text: string, terminal: Terminal, execute: boolean = false): void {
        const vsTerminal = this.getOrCreateTerminal(terminal);
        vsTerminal.show(true);
        vsTerminal.sendText(text, execute);
    }

    /**
     * Gets terminal output (placeholder - VS Code API doesn't support reading output directly)
     */
    async getTerminalOutput(terminal: Terminal): Promise<string> {
        // Note: VS Code API doesn't provide direct access to terminal output
        // This would require using node-pty or similar for actual output capture
        // For now, return a message
        return 'Terminal output capture not available in VS Code API';
    }

    /**
     * Utility function to sleep
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Disposes all resources
     */
    dispose(): void {
        this.closeAllTerminals();
    }
}
