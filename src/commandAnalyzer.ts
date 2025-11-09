import { Terminal } from './terminalDetector';
import { ConfigManager } from './configManager';

export class CommandAnalyzer {
    constructor(private configManager: ConfigManager) {}

    /**
     * Analyzes a command and returns the most suitable terminal
     * This is the core switch-case logic for smart terminal selection
     */
    analyzeCommand(command: string, availableTerminals: Terminal[]): Terminal {
        const commandType = this.detectCommandType(command);
        const preferredTerminalType = this.getPreferredTerminalType(commandType);
        
        // Try to find the preferred terminal
        let terminal = availableTerminals.find(t => t.type === preferredTerminalType);
        
        // If preferred terminal not found, use default
        if (!terminal) {
            const defaultTerminalName = this.configManager.getDefaultTerminal();
            terminal = availableTerminals.find(t => t.name === defaultTerminalName);
        }
        
        // If still not found, use first available
        if (!terminal && availableTerminals.length > 0) {
            terminal = availableTerminals[0];
        }
        
        if (!terminal) {
            throw new Error('No terminal available');
        }
        
        return terminal;
    }

    /**
     * Detects the type of command being executed
     */
    private detectCommandType(command: string): string {
        const trimmedCommand = command.trim().toLowerCase();
        const firstWord = trimmedCommand.split(/\s+/)[0];
        
        // Remove common prefixes
        const cleanCommand = firstWord
            .replace(/^(sudo|doas)\s+/, '')
            .replace(/\.(exe|bat|cmd|sh|ps1)$/, '');
        
        return cleanCommand;
    }

    /**
     * Switch-case logic to determine preferred terminal type based on command
     */
    private getPreferredTerminalType(commandType: string): string {
        // Check user-defined priorities first
        const userPriority = this.configManager.getTerminalPriority(commandType);
        if (userPriority) {
            return this.mapTerminalNameToType(userPriority);
        }

        // Default switch-case logic
        switch (commandType) {
            // Node.js ecosystem
            case 'npm':
            case 'npx':
            case 'node':
            case 'yarn':
            case 'pnpm':
            case 'bun':
                return 'powershell';

            // Git operations
            case 'git':
            case 'gh':
            case 'hub':
                return 'gitbash';

            // Python ecosystem
            case 'python':
            case 'python3':
            case 'py':
            case 'pip':
            case 'pip3':
            case 'pipenv':
            case 'poetry':
            case 'conda':
                return 'cmd';

            // Docker & Kubernetes
            case 'docker':
            case 'docker-compose':
            case 'kubectl':
            case 'k9s':
            case 'helm':
            case 'minikube':
                return 'powershell';

            // Shell scripts
            case 'bash':
            case 'sh':
            case 'zsh':
            case 'fish':
                return 'gitbash';

            // WSL & Linux commands
            case 'wsl':
            case 'ubuntu':
            case 'debian':
            case 'kali':
            case 'apt':
            case 'apt-get':
            case 'yum':
            case 'dnf':
            case 'pacman':
                return 'wsl';

            // Build tools
            case 'make':
            case 'cmake':
            case 'gradle':
            case 'maven':
            case 'mvn':
                return 'powershell';

            // Rust ecosystem
            case 'cargo':
            case 'rustc':
            case 'rustup':
                return 'powershell';

            // Go ecosystem
            case 'go':
            case 'gofmt':
                return 'powershell';

            // PHP ecosystem
            case 'php':
            case 'composer':
            case 'artisan':
                return 'cmd';

            // Ruby ecosystem
            case 'ruby':
            case 'gem':
            case 'bundle':
            case 'rails':
                return 'cmd';

            // .NET ecosystem
            case 'dotnet':
            case 'nuget':
            case 'msbuild':
                return 'powershell';

            // Database CLIs
            case 'mysql':
            case 'psql':
            case 'mongo':
            case 'redis-cli':
            case 'sqlite3':
                return 'cmd';

            // Cloud CLIs
            case 'aws':
            case 'az':
            case 'gcloud':
            case 'terraform':
            case 'pulumi':
                return 'powershell';

            // Version managers
            case 'nvm':
            case 'pyenv':
            case 'rbenv':
            case 'sdkman':
                return 'gitbash';

            // Text editors & IDEs
            case 'vim':
            case 'nvim':
            case 'nano':
            case 'emacs':
            case 'code':
                return 'powershell';

            // System commands (Windows)
            case 'dir':
            case 'copy':
            case 'move':
            case 'del':
            case 'type':
            case 'cls':
            case 'ipconfig':
            case 'netstat':
            case 'tasklist':
            case 'taskkill':
                return 'cmd';

            // System commands (Unix-like)
            case 'ls':
            case 'cd':
            case 'pwd':
            case 'cat':
            case 'grep':
            case 'find':
            case 'sed':
            case 'awk':
            case 'curl':
            case 'wget':
            case 'ssh':
            case 'scp':
            case 'rsync':
                return 'gitbash';

            // PowerShell specific
            case 'get-command':
            case 'get-help':
            case 'get-process':
            case 'get-service':
            case 'start-process':
            case 'stop-process':
                return 'powershell';

            // Default case
            default:
                // If command contains Unix-like path separators, prefer Git Bash
                if (commandType.includes('/')) {
                    return 'gitbash';
                }
                // If command contains Windows path separators, prefer CMD
                if (commandType.includes('\\')) {
                    return 'cmd';
                }
                // Default to PowerShell for unknown commands
                return 'powershell';
        }
    }

    /**
     * Maps terminal name to terminal type
     */
    private mapTerminalNameToType(terminalName: string): string {
        const lowerName = terminalName.toLowerCase();
        
        if (lowerName.includes('powershell')) {
            return 'powershell';
        }
        if (lowerName.includes('cmd') || lowerName.includes('command')) {
            return 'cmd';
        }
        if (lowerName.includes('bash') || lowerName.includes('git')) {
            return 'gitbash';
        }
        if (lowerName.includes('wsl') || lowerName.includes('ubuntu') || lowerName.includes('linux')) {
            return 'wsl';
        }
        
        return 'custom';
    }

    /**
     * Gets a human-readable explanation of why a terminal was chosen
     */
    getRecommendationReason(command: string, terminal: Terminal): string {
        const commandType = this.detectCommandType(command);
        
        switch (commandType) {
            case 'npm':
            case 'node':
            case 'yarn':
                return `Node.js komutları için ${terminal.name} önerilir`;
            case 'git':
                return `Git komutları için ${terminal.name} en uygun seçimdir`;
            case 'python':
            case 'pip':
                return `Python komutları için ${terminal.name} tercih edilir`;
            case 'docker':
            case 'kubectl':
                return `Container ve orchestration komutları için ${terminal.name} önerilir`;
            case 'wsl':
                return `Linux komutları için ${terminal.name} gereklidir`;
            default:
                return `${terminal.name} bu komut için uygun bir seçimdir`;
        }
    }

    /**
     * Checks if a command requires a specific terminal
     */
    requiresSpecificTerminal(command: string): boolean {
        const commandType = this.detectCommandType(command);
        const requiresSpecific = ['wsl', 'bash', 'sh', 'apt', 'apt-get', 'yum'];
        return requiresSpecific.includes(commandType);
    }
}
