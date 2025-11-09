import * as vscode from 'vscode';
import { TerminalDetector, TerminalDetectionResult } from '../terminalDetector';
import { CommandAnalyzer } from '../commandAnalyzer';
import { TerminalLauncher } from '../terminalLauncher';
import { ConfigManager } from '../configManager';
import { StatisticsCollector } from '../statisticsCollector';

export class PanelProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private terminals?: TerminalDetectionResult;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private terminalDetector: TerminalDetector,
        private commandAnalyzer: CommandAnalyzer,
        private terminalLauncher: TerminalLauncher,
        private configManager: ConfigManager,
        private statisticsCollector: StatisticsCollector
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'autoDetect':
                    await this.handleAutoDetect();
                    break;
                case 'runCommand':
                    await this.handleRunCommand(data.command, data.terminal);
                    break;
                case 'autoRunCommand':
                    await this.handleAutoRunCommand(data.command);
                    break;
                case 'getTerminals':
                    await this.handleGetTerminals();
                    break;
                case 'getStatistics':
                    await this.handleGetStatistics();
                    break;
                case 'updateSettings':
                    await this.handleUpdateSettings(data.settings);
                    break;
            }
        });

        // Initial terminal detection
        this.handleAutoDetect();
    }

    public show() {
        if (this._view) {
            this._view.show?.(true);
        }
    }

    public updateTerminals(terminals: TerminalDetectionResult) {
        this.terminals = terminals;
        this._view?.webview.postMessage({
            type: 'terminalsUpdated',
            terminals
        });
    }

    private async handleAutoDetect() {
        try {
            const terminals = await this.terminalDetector.detectTerminals();
            this.updateTerminals(terminals);
            
            vscode.window.showInformationMessage(
                `${terminals.available.length} terminal tespit edildi!`
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Terminal tespiti başarısız: ${error}`);
        }
    }

    private async handleRunCommand(command: string, terminalName: string) {
        try {
            if (!this.terminals) {
                await this.handleAutoDetect();
            }

            const terminal = this.terminals?.available.find(t => t.name === terminalName);
            if (!terminal) {
                vscode.window.showErrorMessage(`Terminal bulunamadı: ${terminalName}`);
                return;
            }

            await this.terminalLauncher.runCommand(command, terminal);
            this.statisticsCollector.recordCommand(command, terminal.name, 'manual');
            
            this._view?.webview.postMessage({
                type: 'commandExecuted',
                success: true,
                message: `Komut ${terminal.name} terminalinde çalıştırıldı`
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Komut çalıştırılamadı: ${error}`);
            this._view?.webview.postMessage({
                type: 'commandExecuted',
                success: false,
                message: `Hata: ${error}`
            });
        }
    }

    private async handleAutoRunCommand(command: string) {
        try {
            if (!this.terminals) {
                await this.handleAutoDetect();
            }

            if (!this.terminals || this.terminals.available.length === 0) {
                vscode.window.showErrorMessage('Kullanılabilir terminal bulunamadı');
                return;
            }

            const recommendedTerminal = this.commandAnalyzer.analyzeCommand(
                command,
                this.terminals.available
            );

            const reason = this.commandAnalyzer.getRecommendationReason(command, recommendedTerminal);

            if (this.configManager.getAutoRunConfirmation()) {
                const confirm = await vscode.window.showInformationMessage(
                    `"${command}" komutu ${recommendedTerminal.name} terminalinde çalıştırılacak.\n\n${reason}\n\nOnaylıyor musunuz?`,
                    'Evet',
                    'Hayır'
                );

                if (confirm !== 'Evet') {
                    return;
                }
            }

            await this.terminalLauncher.runCommand(command, recommendedTerminal);
            this.statisticsCollector.recordCommand(command, recommendedTerminal.name, 'auto');

            this._view?.webview.postMessage({
                type: 'commandExecuted',
                success: true,
                message: `Komut ${recommendedTerminal.name} terminalinde otomatik olarak çalıştırıldı`,
                terminal: recommendedTerminal.name,
                reason
            });

            vscode.window.showInformationMessage(
                `✓ ${recommendedTerminal.name} terminalinde çalıştırıldı`
            );
        } catch (error) {
            vscode.window.showErrorMessage(`AutoRun başarısız: ${error}`);
            this._view?.webview.postMessage({
                type: 'commandExecuted',
                success: false,
                message: `Hata: ${error}`
            });
        }
    }

    private async handleGetTerminals() {
        if (!this.terminals) {
            await this.handleAutoDetect();
        } else {
            this.updateTerminals(this.terminals);
        }
    }

    private async handleGetStatistics() {
        const statistics = this.statisticsCollector.getStatistics();
        const summary = this.statisticsCollector.getStatisticsSummary();
        const insights = this.statisticsCollector.getInsights();

        this._view?.webview.postMessage({
            type: 'statisticsUpdated',
            statistics,
            summary,
            insights
        });
    }

    private async handleUpdateSettings(settings: any) {
        try {
            if (settings.defaultTerminal !== undefined) {
                await this.configManager.setDefaultTerminal(settings.defaultTerminal);
            }
            if (settings.autoDetectOnStartup !== undefined) {
                await this.configManager.setAutoDetectOnStartup(settings.autoDetectOnStartup);
            }
            if (settings.enableStatistics !== undefined) {
                await this.configManager.setEnableStatistics(settings.enableStatistics);
            }
            if (settings.autoRunConfirmation !== undefined) {
                await this.configManager.setAutoRunConfirmation(settings.autoRunConfirmation);
            }

            vscode.window.showInformationMessage('Ayarlar güncellendi');
        } catch (error) {
            vscode.window.showErrorMessage(`Ayarlar güncellenemedi: ${error}`);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'panel.css')
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'panel.js')
        );

        return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>Smart Terminal Launcher</title>
</head>
<body>
    <div class="panel-container">
        <!-- Dropdowns Section -->
        <div class="dropdowns-section">
            <div class="dropdown-group">
                <label>Current</label>
                <select id="current-terminal" class="terminal-select">
                    <option value="">Yükleniyor...</option>
                </select>
            </div>
            
            <div class="dropdown-group">
                <label>Unavailable</label>
                <select id="unavailable-terminals" class="terminal-select" multiple size="3">
                    <option value="">Yükleniyor...</option>
                </select>
            </div>
            
            <div class="dropdown-group">
                <label>Recommended</label>
                <select id="recommended-terminals" class="terminal-select" multiple size="3">
                    <option value="">Yükleniyor...</option>
                </select>
            </div>
        </div>
        
        <!-- Checkbox Section -->
        <div class="checkbox-section">
            <label class="checkbox-label">
                <input type="checkbox" id="check-bash" value="bash"> Bash
            </label>
            <label class="checkbox-label">
                <input type="checkbox" id="check-powershell" value="powershell" checked> PowerShell
            </label>
            <label class="checkbox-label">
                <input type="checkbox" id="check-cmd" value="cmd"> CMD
            </label>
            <label class="checkbox-label">
                <input type="checkbox" id="check-wsl" value="wsl"> WSL
            </label>
        </div>
        
        <!-- Command Section -->
        <div class="command-section">
            <div class="command-header">
                <span class="label">Instruction</span>
                <input type="text" id="command-input" class="command-input" placeholder="Komutunuzu girin... (örn: npm install)">
            </div>
            <div class="command-actions">
                <span class="label">Terminals</span>
                <select id="terminal-selector" class="terminal-select-small">
                    <option value="">Terminal seçin...</option>
                </select>
                <button id="run-button" class="btn btn-primary" title="Seçili terminalde çalıştır">
                    ▶ Run
                </button>
                <button id="autorun-button" class="btn btn-success" title="Otomatik terminal seçimi ile çalıştır">
                    ⚡ AutoRun
                </button>
            </div>
        </div>
        
        <!-- Output Section -->
        <div class="output-section">
            <div class="instructions-label">// instructions follow</div>
            <div id="terminal-output" class="terminal-output">
                <div class="output-placeholder">Komut çıktıları burada görünecek...</div>
            </div>
        </div>
        
        <!-- Actions Section -->
        <div class="actions-section">
            <button id="autodetect-btn" class="btn btn-secondary">
                🔍 Autodetect Terminals
            </button>
            <button id="statistics-btn" class="btn btn-secondary">
                📊 İstatistikler
            </button>
            <button id="settings-btn" class="btn btn-secondary">
                ⚙️ Ayarlar
            </button>
        </div>
        
        <!-- Status Bar -->
        <div id="status-bar" class="status-bar">
            Hazır
        </div>
    </div>
    
    <script src="${scriptUri}"></script>
</body>
</html>`;
    }
}
