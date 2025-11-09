import { ConfigManager } from './configManager';

interface CommandStatistic {
    command: string;
    commandType: string;
    terminal: string;
    executionType: 'manual' | 'auto';
    timestamp: number;
}

interface Statistics {
    totalCommands: number;
    commandsByType: Record<string, number>;
    terminalUsage: Record<string, number>;
    autoVsManual: {
        auto: number;
        manual: number;
    };
    mostUsedCommands: Array<{ command: string; count: number }>;
    lastUpdated: number;
}

export class StatisticsCollector {
    private statistics: Statistics;
    private commandHistory: CommandStatistic[] = [];
    private readonly maxHistorySize = 1000;

    constructor(private configManager: ConfigManager) {
        this.statistics = this.initializeStatistics();
        this.loadStatistics();
    }

    /**
     * Records a command execution
     */
    recordCommand(command: string, terminal: string, executionType: 'manual' | 'auto'): void {
        // Only record if statistics are enabled
        if (!this.configManager.getEnableStatistics()) {
            return;
        }

        const commandType = this.extractCommandType(command);
        
        const statistic: CommandStatistic = {
            command: this.anonymizeCommand(command),
            commandType,
            terminal,
            executionType,
            timestamp: Date.now()
        };

        // Add to history
        this.commandHistory.push(statistic);
        
        // Trim history if too large
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory = this.commandHistory.slice(-this.maxHistorySize);
        }

        // Update statistics
        this.updateStatistics(statistic);
        
        // Save to storage
        this.saveStatistics();
    }

    /**
     * Gets current statistics
     */
    getStatistics(): Statistics {
        return { ...this.statistics };
    }

    /**
     * Gets command history
     */
    getCommandHistory(limit?: number): CommandStatistic[] {
        if (limit) {
            return this.commandHistory.slice(-limit);
        }
        return [...this.commandHistory];
    }

    /**
     * Clears all statistics
     */
    clearStatistics(): void {
        this.statistics = this.initializeStatistics();
        this.commandHistory = [];
        this.saveStatistics();
    }

    /**
     * Exports statistics as JSON
     */
    exportStatistics(): string {
        return JSON.stringify({
            statistics: this.statistics,
            history: this.commandHistory
        }, null, 2);
    }

    /**
     * Gets statistics summary
     */
    getStatisticsSummary(): string {
        const stats = this.statistics;
        
        let summary = '📊 Smart Terminal Launcher - İstatistikler\n\n';
        summary += `Toplam Komut: ${stats.totalCommands}\n`;
        summary += `Son Güncelleme: ${new Date(stats.lastUpdated).toLocaleString('tr-TR')}\n\n`;
        
        summary += '🎯 Çalıştırma Tipi:\n';
        summary += `  • Otomatik (AutoRun): ${stats.autoVsManual.auto} (${this.getPercentage(stats.autoVsManual.auto, stats.totalCommands)}%)\n`;
        summary += `  • Manuel (Run): ${stats.autoVsManual.manual} (${this.getPercentage(stats.autoVsManual.manual, stats.totalCommands)}%)\n\n`;
        
        summary += '💻 Terminal Kullanımı:\n';
        const sortedTerminals = Object.entries(stats.terminalUsage)
            .sort((a, b) => b[1] - a[1]);
        for (const [terminal, count] of sortedTerminals) {
            summary += `  • ${terminal}: ${count} (${this.getPercentage(count, stats.totalCommands)}%)\n`;
        }
        summary += '\n';
        
        summary += '📝 En Çok Kullanılan Komut Tipleri:\n';
        const sortedCommands = Object.entries(stats.commandsByType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        for (const [commandType, count] of sortedCommands) {
            summary += `  • ${commandType}: ${count} (${this.getPercentage(count, stats.totalCommands)}%)\n`;
        }
        
        return summary;
    }

    /**
     * Gets insights based on statistics
     */
    getInsights(): string[] {
        const insights: string[] = [];
        const stats = this.statistics;

        // AutoRun usage insight
        const autoPercentage = this.getPercentage(stats.autoVsManual.auto, stats.totalCommands);
        if (autoPercentage > 70) {
            insights.push('🎯 AutoRun özelliğini çok kullanıyorsunuz! Akıllı terminal seçimi size zaman kazandırıyor.');
        } else if (autoPercentage < 30) {
            insights.push('💡 AutoRun özelliğini daha fazla kullanarak zaman kazanabilirsiniz.');
        }

        // Most used terminal
        const sortedTerminals = Object.entries(stats.terminalUsage)
            .sort((a, b) => b[1] - a[1]);
        if (sortedTerminals.length > 0) {
            const [mostUsed, count] = sortedTerminals[0];
            const percentage = this.getPercentage(count, stats.totalCommands);
            if (percentage > 60) {
                insights.push(`💻 En çok ${mostUsed} terminalini kullanıyorsunuz (%${percentage}).`);
            }
        }

        // Command diversity
        const uniqueCommandTypes = Object.keys(stats.commandsByType).length;
        if (uniqueCommandTypes > 10) {
            insights.push(`🌟 ${uniqueCommandTypes} farklı komut tipi kullanıyorsunuz. Çok yönlü bir geliştiricisiniz!`);
        }

        // Git usage
        const gitCommands = stats.commandsByType['git'] || 0;
        if (gitCommands > stats.totalCommands * 0.3) {
            insights.push('🔧 Git komutlarını sık kullanıyorsunuz. Git Bash terminaliniz optimize edilmiş durumda.');
        }

        // Node.js usage
        const nodeCommands = (stats.commandsByType['npm'] || 0) + 
                            (stats.commandsByType['node'] || 0) + 
                            (stats.commandsByType['yarn'] || 0);
        if (nodeCommands > stats.totalCommands * 0.3) {
            insights.push('📦 Node.js ekosisteminde aktif çalışıyorsunuz. PowerShell terminaliniz Node.js için optimize edilmiş.');
        }

        return insights;
    }

    /**
     * Initializes empty statistics
     */
    private initializeStatistics(): Statistics {
        return {
            totalCommands: 0,
            commandsByType: {},
            terminalUsage: {},
            autoVsManual: {
                auto: 0,
                manual: 0
            },
            mostUsedCommands: [],
            lastUpdated: Date.now()
        };
    }

    /**
     * Updates statistics with new command
     */
    private updateStatistics(statistic: CommandStatistic): void {
        this.statistics.totalCommands++;
        
        // Update command type count
        this.statistics.commandsByType[statistic.commandType] = 
            (this.statistics.commandsByType[statistic.commandType] || 0) + 1;
        
        // Update terminal usage
        this.statistics.terminalUsage[statistic.terminal] = 
            (this.statistics.terminalUsage[statistic.terminal] || 0) + 1;
        
        // Update auto vs manual
        this.statistics.autoVsManual[statistic.executionType]++;
        
        // Update most used commands
        this.updateMostUsedCommands(statistic.commandType);
        
        // Update timestamp
        this.statistics.lastUpdated = Date.now();
    }

    /**
     * Updates most used commands list
     */
    private updateMostUsedCommands(commandType: string): void {
        const existing = this.statistics.mostUsedCommands.find(c => c.command === commandType);
        
        if (existing) {
            existing.count++;
        } else {
            this.statistics.mostUsedCommands.push({ command: commandType, count: 1 });
        }
        
        // Sort and keep top 20
        this.statistics.mostUsedCommands.sort((a, b) => b.count - a.count);
        this.statistics.mostUsedCommands = this.statistics.mostUsedCommands.slice(0, 20);
    }

    /**
     * Extracts command type from full command
     */
    private extractCommandType(command: string): string {
        const trimmed = command.trim().toLowerCase();
        const firstWord = trimmed.split(/\s+/)[0];
        return firstWord.replace(/\.(exe|bat|cmd|sh|ps1)$/, '');
    }

    /**
     * Anonymizes command by removing sensitive data
     * Only keeps the command type, not the full command with arguments
     */
    private anonymizeCommand(command: string): string {
        // Only store command type, not full command with potentially sensitive args
        return this.extractCommandType(command);
    }

    /**
     * Calculates percentage
     */
    private getPercentage(value: number, total: number): number {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }

    /**
     * Loads statistics from storage (placeholder)
     */
    private loadStatistics(): void {
        // TODO: Implement persistent storage using VS Code's globalState
        // For now, statistics are only kept in memory
    }

    /**
     * Saves statistics to storage (placeholder)
     */
    private saveStatistics(): void {
        // TODO: Implement persistent storage using VS Code's globalState
        // For now, statistics are only kept in memory
    }

    /**
     * Disposes resources
     */
    dispose(): void {
        this.saveStatistics();
    }
}
