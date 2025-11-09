// @ts-check

(function () {
    const vscode = acquireVsCodeApi();

    // DOM Elements
    const currentTerminal = document.getElementById('current-terminal');
    const unavailableTerminals = document.getElementById('unavailable-terminals');
    const recommendedTerminals = document.getElementById('recommended-terminals');
    const commandInput = document.getElementById('command-input');
    const terminalSelector = document.getElementById('terminal-selector');
    const runButton = document.getElementById('run-button');
    const autorunButton = document.getElementById('autorun-button');
    const autodetectBtn = document.getElementById('autodetect-btn');
    const statisticsBtn = document.getElementById('statistics-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const terminalOutput = document.getElementById('terminal-output');
    const statusBar = document.getElementById('status-bar');

    // Checkboxes
    const checkBash = document.getElementById('check-bash');
    const checkPowershell = document.getElementById('check-powershell');
    const checkCmd = document.getElementById('check-cmd');
    const checkWsl = document.getElementById('check-wsl');

    // State
    let terminals = {
        available: [],
        unavailable: [],
        recommended: []
    };

    // Initialize
    init();

    function init() {
        setupEventListeners();
        requestTerminals();
        loadCommandHistory();
    }

    function setupEventListeners() {
        // Run button
        runButton.addEventListener('click', () => {
            const command = commandInput.value.trim();
            const terminal = terminalSelector.value;

            if (!command) {
                showStatus('Lütfen bir komut girin', 'warning');
                return;
            }

            if (!terminal) {
                showStatus('Lütfen bir terminal seçin', 'warning');
                return;
            }

            runCommand(command, terminal);
        });

        // AutoRun button
        autorunButton.addEventListener('click', () => {
            const command = commandInput.value.trim();

            if (!command) {
                showStatus('Lütfen bir komut girin', 'warning');
                return;
            }

            autoRunCommand(command);
        });

        // Autodetect button
        autodetectBtn.addEventListener('click', () => {
            autoDetectTerminals();
        });

        // Statistics button
        statisticsBtn.addEventListener('click', () => {
            showStatistics();
        });

        // Settings button
        settingsBtn.addEventListener('click', () => {
            showSettings();
        });

        // Command input - Enter key
        commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (e.ctrlKey || e.metaKey) {
                    autorunButton.click();
                } else {
                    runButton.click();
                }
            }
        });

        // Command input - save to history
        commandInput.addEventListener('input', () => {
            saveCommandHistory(commandInput.value);
        });

        // Terminal selector change
        terminalSelector.addEventListener('change', () => {
            updateCheckboxes();
        });

        // Checkboxes
        [checkBash, checkPowershell, checkCmd, checkWsl].forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                filterTerminals();
            });
        });
    }

    function runCommand(command, terminal) {
        showStatus('Komut çalıştırılıyor...', '');
        addOutputLine(`> ${command}`, 'info');
        addOutputLine(`Terminal: ${terminal}`, 'info');

        vscode.postMessage({
            type: 'runCommand',
            command: command,
            terminal: terminal
        });

        saveToHistory(command);
    }

    function autoRunCommand(command) {
        showStatus('Otomatik terminal seçimi yapılıyor...', '');
        addOutputLine(`> ${command}`, 'info');
        addOutputLine(`AutoRun modu aktif - En uygun terminal seçiliyor...`, 'warning');

        vscode.postMessage({
            type: 'autoRunCommand',
            command: command
        });

        saveToHistory(command);
    }

    function autoDetectTerminals() {
        showStatus('Terminaller tespit ediliyor...', '');
        vscode.postMessage({
            type: 'autoDetect'
        });
    }

    function requestTerminals() {
        vscode.postMessage({
            type: 'getTerminals'
        });
    }

    function showStatistics() {
        vscode.postMessage({
            type: 'getStatistics'
        });
    }

    function showSettings() {
        // TODO: Implement settings panel
        showStatus('Ayarlar paneli yakında eklenecek...', 'warning');
    }

    function updateTerminalLists(data) {
        terminals = data;

        // Update Current dropdown
        currentTerminal.innerHTML = '';
        if (data.available.length === 0) {
            currentTerminal.innerHTML = '<option value="">Terminal bulunamadı</option>';
        } else {
            data.available.forEach(terminal => {
                const option = document.createElement('option');
                option.value = terminal.name;
                option.textContent = `${terminal.name} (${terminal.type})`;
                currentTerminal.appendChild(option);
            });
        }

        // Update Unavailable dropdown
        unavailableTerminals.innerHTML = '';
        if (data.unavailable.length === 0) {
            unavailableTerminals.innerHTML = '<option value="">Tüm terminaller mevcut</option>';
        } else {
            data.unavailable.forEach(terminal => {
                const option = document.createElement('option');
                option.value = terminal.name;
                option.textContent = `${terminal.name} (${terminal.type})`;
                unavailableTerminals.appendChild(option);
            });
        }

        // Update Recommended dropdown
        recommendedTerminals.innerHTML = '';
        if (data.recommended.length === 0) {
            recommendedTerminals.innerHTML = '<option value="">Öneri yok</option>';
        } else {
            data.recommended.forEach(terminal => {
                const option = document.createElement('option');
                option.value = terminal.name;
                option.textContent = `${terminal.name} (${terminal.type})`;
                recommendedTerminals.appendChild(option);
            });
        }

        // Update terminal selector
        terminalSelector.innerHTML = '<option value="">Terminal seçin...</option>';
        data.available.forEach(terminal => {
            const option = document.createElement('option');
            option.value = terminal.name;
            option.textContent = terminal.name;
            terminalSelector.appendChild(option);
        });

        // Update checkboxes based on available terminals
        updateCheckboxesAvailability(data.available);

        showStatus(`${data.available.length} terminal tespit edildi`, 'success');
    }

    function updateCheckboxesAvailability(availableTerminals) {
        const hasGitBash = availableTerminals.some(t => t.type === 'gitbash');
        const hasPowerShell = availableTerminals.some(t => t.type === 'powershell');
        const hasCmd = availableTerminals.some(t => t.type === 'cmd');
        const hasWsl = availableTerminals.some(t => t.type === 'wsl');

        checkBash.disabled = !hasGitBash;
        checkPowershell.disabled = !hasPowerShell;
        checkCmd.disabled = !hasCmd;
        checkWsl.disabled = !hasWsl;

        // Auto-check available terminals
        checkBash.checked = hasGitBash;
        checkPowershell.checked = hasPowerShell;
        checkCmd.checked = hasCmd;
        checkWsl.checked = hasWsl;
    }

    function updateCheckboxes() {
        const selectedTerminal = terminalSelector.value;
        if (!selectedTerminal) return;

        const terminal = terminals.available.find(t => t.name === selectedTerminal);
        if (!terminal) return;

        // Update checkboxes based on selected terminal type
        checkBash.checked = terminal.type === 'gitbash';
        checkPowershell.checked = terminal.type === 'powershell';
        checkCmd.checked = terminal.type === 'cmd';
        checkWsl.checked = terminal.type === 'wsl';
    }

    function filterTerminals() {
        const selectedTypes = [];
        if (checkBash.checked) selectedTypes.push('gitbash');
        if (checkPowershell.checked) selectedTypes.push('powershell');
        if (checkCmd.checked) selectedTypes.push('cmd');
        if (checkWsl.checked) selectedTypes.push('wsl');

        // Filter terminal selector
        terminalSelector.innerHTML = '<option value="">Terminal seçin...</option>';
        terminals.available
            .filter(t => selectedTypes.includes(t.type))
            .forEach(terminal => {
                const option = document.createElement('option');
                option.value = terminal.name;
                option.textContent = terminal.name;
                terminalSelector.appendChild(option);
            });
    }

    function addOutputLine(text, type = '') {
        const line = document.createElement('div');
        line.className = `output-line ${type ? 'output-' + type : ''}`;
        line.textContent = text;
        
        // Remove placeholder if exists
        const placeholder = terminalOutput.querySelector('.output-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function clearOutput() {
        terminalOutput.innerHTML = '<div class="output-placeholder">Komut çıktıları burada görünecek...</div>';
    }

    function showStatus(message, type = '') {
        statusBar.textContent = message;
        statusBar.className = 'status-bar' + (type ? ' ' + type : '');
    }

    function saveToHistory(command) {
        const history = getCommandHistory();
        if (!history.includes(command)) {
            history.unshift(command);
            if (history.length > 50) {
                history.pop();
            }
            localStorage.setItem('commandHistory', JSON.stringify(history));
        }
    }

    function getCommandHistory() {
        const history = localStorage.getItem('commandHistory');
        return history ? JSON.parse(history) : [];
    }

    function loadCommandHistory() {
        // TODO: Implement command history dropdown/autocomplete
    }

    function saveCommandHistory(command) {
        localStorage.setItem('lastCommand', command);
    }

    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;

        switch (message.type) {
            case 'terminalsUpdated':
                updateTerminalLists(message.terminals);
                break;

            case 'commandExecuted':
                if (message.success) {
                    addOutputLine(message.message, 'success');
                    if (message.terminal) {
                        addOutputLine(`✓ Terminal: ${message.terminal}`, 'success');
                    }
                    if (message.reason) {
                        addOutputLine(`ℹ ${message.reason}`, 'info');
                    }
                    showStatus('Komut başarıyla çalıştırıldı', 'success');
                } else {
                    addOutputLine(message.message, 'error');
                    showStatus('Komut çalıştırılamadı', 'error');
                }
                break;

            case 'statisticsUpdated':
                displayStatistics(message);
                break;
        }
    });

    function displayStatistics(data) {
        clearOutput();
        addOutputLine('=== İSTATİSTİKLER ===', 'info');
        addOutputLine('');
        
        const lines = data.summary.split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                addOutputLine(line);
            }
        });

        if (data.insights && data.insights.length > 0) {
            addOutputLine('');
            addOutputLine('=== İÇGÖRÜLER ===', 'warning');
            data.insights.forEach(insight => {
                addOutputLine(insight, 'info');
            });
        }

        showStatus('İstatistikler gösteriliyor', 'success');
    }
})();
