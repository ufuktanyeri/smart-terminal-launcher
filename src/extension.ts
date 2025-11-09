import * as vscode from 'vscode';
import { TerminalDetector } from './terminalDetector';
import { CommandAnalyzer } from './commandAnalyzer';
import { TerminalLauncher } from './terminalLauncher';
import { ConfigManager } from './configManager';
import { StatisticsCollector } from './statisticsCollector';
import { PanelProvider } from './webview/panelProvider';

let terminalDetector: TerminalDetector;
let commandAnalyzer: CommandAnalyzer;
let terminalLauncher: TerminalLauncher;
let configManager: ConfigManager;
let statisticsCollector: StatisticsCollector;
let panelProvider: PanelProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('Smart Terminal Launcher is now active!');

    // Initialize components
    configManager = new ConfigManager();
    terminalDetector = new TerminalDetector();
    commandAnalyzer = new CommandAnalyzer(configManager);
    terminalLauncher = new TerminalLauncher();
    statisticsCollector = new StatisticsCollector(configManager);
    panelProvider = new PanelProvider(
        context.extensionUri,
        terminalDetector,
        commandAnalyzer,
        terminalLauncher,
        configManager,
        statisticsCollector
    );

    // Auto-detect terminals on startup if enabled
    if (configManager.getAutoDetectOnStartup()) {
        terminalDetector.detectTerminals().then(terminals => {
            console.log('Auto-detected terminals:', terminals);
            vscode.window.showInformationMessage(
                `${terminals.available.length} terminal tespit edildi!`
            );
        });
    }

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('smartTerminal.openPanel', () => {
            panelProvider.show();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('smartTerminal.autoDetect', async () => {
            const terminals = await terminalDetector.detectTerminals();
            vscode.window.showInformationMessage(
                `Tespit edilen terminaller: ${terminals.available.length} mevcut, ${terminals.unavailable.length} eksik`
            );
            panelProvider.updateTerminals(terminals);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('smartTerminal.runCommand', async () => {
            const command = await vscode.window.showInputBox({
                prompt: 'Çalıştırılacak komutu girin',
                placeHolder: 'npm install'
            });

            if (command) {
                const terminals = await terminalDetector.detectTerminals();
                const terminalNames = terminals.available.map(t => t.name);
                
                const selectedTerminal = await vscode.window.showQuickPick(terminalNames, {
                    placeHolder: 'Terminal seçin'
                });

                if (selectedTerminal) {
                    const terminal = terminals.available.find(t => t.name === selectedTerminal);
                    if (terminal) {
                        await terminalLauncher.runCommand(command, terminal);
                        statisticsCollector.recordCommand(command, terminal.name, 'manual');
                    }
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('smartTerminal.autoRunCommand', async () => {
            const command = await vscode.window.showInputBox({
                prompt: 'Çalıştırılacak komutu girin (otomatik terminal seçimi)',
                placeHolder: 'git status'
            });

            if (command) {
                const terminals = await terminalDetector.detectTerminals();
                const recommendedTerminal = commandAnalyzer.analyzeCommand(command, terminals.available);

                if (configManager.getAutoRunConfirmation()) {
                    const confirm = await vscode.window.showInformationMessage(
                        `"${command}" komutu ${recommendedTerminal.name} terminalinde çalıştırılacak. Onaylıyor musunuz?`,
                        'Evet',
                        'Hayır'
                    );

                    if (confirm !== 'Evet') {
                        return;
                    }
                }

                await terminalLauncher.runCommand(command, recommendedTerminal);
                statisticsCollector.recordCommand(command, recommendedTerminal.name, 'auto');
                
                vscode.window.showInformationMessage(
                    `Komut ${recommendedTerminal.name} terminalinde çalıştırıldı`
                );
            }
        })
    );

    // Register webview provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'smartTerminal.panel',
            panelProvider
        )
    );

    // Show welcome message on first install
    const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
    if (!hasShownWelcome) {
        vscode.window.showInformationMessage(
            'Smart Terminal Launcher yüklendi! Ctrl+Shift+T ile paneli açabilirsiniz.',
            'Paneli Aç'
        ).then(selection => {
            if (selection === 'Paneli Aç') {
                vscode.commands.executeCommand('smartTerminal.openPanel');
            }
        });
        context.globalState.update('hasShownWelcome', true);
    }
}

export function deactivate() {
    console.log('Smart Terminal Launcher is now deactivated');
    
    // Cleanup
    if (statisticsCollector) {
        statisticsCollector.dispose();
    }
}
