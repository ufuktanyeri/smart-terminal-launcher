import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface Terminal {
    name: string;
    path: string;
    type: 'powershell' | 'cmd' | 'gitbash' | 'wsl' | 'custom';
    icon: string;
    available: boolean;
}

export interface TerminalDetectionResult {
    available: Terminal[];
    unavailable: Terminal[];
    recommended: Terminal[];
}

export class TerminalDetector {
    private knownTerminals: Terminal[] = [
        {
            name: 'PowerShell',
            path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
            type: 'powershell',
            icon: 'terminal-powershell',
            available: false
        },
        {
            name: 'Windows PowerShell',
            path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
            type: 'powershell',
            icon: 'terminal-powershell',
            available: false
        },
        {
            name: 'Command Prompt',
            path: 'C:\\Windows\\System32\\cmd.exe',
            type: 'cmd',
            icon: 'terminal-cmd',
            available: false
        },
        {
            name: 'Git Bash',
            path: 'C:\\Program Files\\Git\\bin\\bash.exe',
            type: 'gitbash',
            icon: 'terminal-bash',
            available: false
        },
        {
            name: 'Git Bash (x86)',
            path: 'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
            type: 'gitbash',
            icon: 'terminal-bash',
            available: false
        },
        {
            name: 'WSL',
            path: 'wsl.exe',
            type: 'wsl',
            icon: 'terminal-linux',
            available: false
        }
    ];

    async detectTerminals(): Promise<TerminalDetectionResult> {
        const available: Terminal[] = [];
        const unavailable: Terminal[] = [];

        for (const terminal of this.knownTerminals) {
            const isAvailable = await this.checkTerminalAvailability(terminal);
            
            if (isAvailable) {
                available.push({ ...terminal, available: true });
            } else {
                unavailable.push({ ...terminal, available: false });
            }
        }

        // Remove duplicates (e.g., PowerShell might be detected twice)
        const uniqueAvailable = this.removeDuplicates(available);
        const uniqueUnavailable = this.removeDuplicates(unavailable);

        // Get OS-based recommendations
        const recommended = this.getRecommendedTerminals(uniqueAvailable);

        return {
            available: uniqueAvailable,
            unavailable: uniqueUnavailable,
            recommended
        };
    }

    private async checkTerminalAvailability(terminal: Terminal): Promise<boolean> {
        try {
            // For WSL, check using 'where' command
            if (terminal.type === 'wsl') {
                try {
                    await execAsync('where wsl');
                    return true;
                } catch {
                    return false;
                }
            }

            // For file-based terminals, check if file exists
            if (fs.existsSync(terminal.path)) {
                return true;
            }

            // Check in PATH
            try {
                const command = process.platform === 'win32' 
                    ? `where "${path.basename(terminal.path)}"` 
                    : `which "${path.basename(terminal.path)}"`;
                await execAsync(command);
                return true;
            } catch {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    private removeDuplicates(terminals: Terminal[]): Terminal[] {
        const seen = new Set<string>();
        return terminals.filter(terminal => {
            const key = `${terminal.type}-${terminal.path}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    private getRecommendedTerminals(availableTerminals: Terminal[]): Terminal[] {
        // For Windows, recommend in this order:
        // 1. PowerShell (modern, best for most tasks)
        // 2. Git Bash (for git operations)
        // 3. WSL (for Linux commands)
        // 4. CMD (legacy support)

        const recommendations: Terminal[] = [];
        const terminalTypes = ['powershell', 'gitbash', 'wsl', 'cmd'];

        for (const type of terminalTypes) {
            const terminal = availableTerminals.find(t => t.type === type);
            if (terminal) {
                recommendations.push(terminal);
            }
        }

        return recommendations;
    }

    async detectCustomTerminals(customPaths: string[]): Promise<Terminal[]> {
        const customTerminals: Terminal[] = [];

        for (const customPath of customPaths) {
            if (fs.existsSync(customPath)) {
                customTerminals.push({
                    name: path.basename(customPath, path.extname(customPath)),
                    path: customPath,
                    type: 'custom',
                    icon: 'terminal',
                    available: true
                });
            }
        }

        return customTerminals;
    }

    async searchInRegistry(): Promise<Terminal[]> {
        // Windows Registry search for installed terminals
        // This is a placeholder for future implementation
        const registryTerminals: Terminal[] = [];

        try {
            // Search common registry paths for terminal installations
            // HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall
            // HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall
            
            // For now, return empty array
            // Future: Use node-winreg or similar package
        } catch (error) {
            console.error('Registry search failed:', error);
        }

        return registryTerminals;
    }

    getTerminalByName(name: string, terminals: Terminal[]): Terminal | undefined {
        return terminals.find(t => t.name === name);
    }

    getTerminalByType(type: string, terminals: Terminal[]): Terminal | undefined {
        return terminals.find(t => t.type === type);
    }
}
