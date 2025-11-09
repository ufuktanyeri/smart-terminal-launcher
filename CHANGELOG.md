# Changelog

All notable changes to the "Smart Terminal Launcher" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Multi-terminal execution (aynı anda birden fazla terminalde çalıştırma)
- Command history (komut geçmişi)
- Favorite commands (favori komutlar)
- Terminal profiles (terminal profilleri)
- Cloud sync (ayarları bulutta senkronize etme)

## [1.0.0] - 2025-01-08

### Added
- 🎯 **AutoRun**: Komut analiz sistemi ile otomatik terminal seçimi
- 🎮 **Run**: Manuel terminal seçimi ile komut çalıştırma
- 🔍 **Otomatik Terminal Tespiti**: PowerShell, CMD, Git Bash, WSL
- 🎨 **Özel Panel UI**: Excel tasarımına göre kullanıcı arayüzü
- 📊 **Current Dropdown**: Mevcut yüklü terminaller
- 📊 **Unavailable Dropdown**: Eksik terminaller (multi-choice)
- 📊 **Recommended Dropdown**: OS'a göre önerilen terminaller (multi-choice)
- ⚙️ **Kullanıcı Ayarları**: Kapsamlı özelleştirme seçenekleri
- 🔐 **Gizlilik Odaklı İstatistikler**: Opt-in anonim kullanım verileri
- ⌨️ **Kısayol Tuşları**: Ctrl+Shift+T (panel), Ctrl+Shift+D (tespit)
- 📝 **Komut Analiz Sistemi**: Switch-case yapısı ile akıllı eşleştirme
- 🎯 **Terminal Öncelikleri**: Komut tiplerine göre özelleştirilebilir
- 🔧 **Özel Terminal Desteği**: Kendi terminalinizi ekleyin
- 📱 **Native Terminal Desteği**: VS Code Terminal API ile gerçek terminal entegrasyonu
- 🌈 **VS Code Terminal**: Doğrudan VS Code terminal altyapısı kullanımı

### Command Mappings
- `npm`, `node`, `yarn`, `pnpm` → PowerShell
- `git` → Git Bash
- `python`, `pip` → CMD
- `docker`, `kubectl` → PowerShell
- `bash`, `sh` → Git Bash
- `wsl`, `linux` → WSL

### Configuration Options
- `smartTerminal.defaultTerminal`: Varsayılan terminal
- `smartTerminal.autoDetectOnStartup`: Otomatik tespit
- `smartTerminal.enableStatistics`: İstatistik toplama
- `smartTerminal.showRecommendations`: Öneri gösterimi
- `smartTerminal.terminalPriority`: Terminal öncelikleri
- `smartTerminal.customTerminals`: Özel terminaller
- `smartTerminal.autoRunConfirmation`: AutoRun onayı

### Commands
- `smartTerminal.openPanel`: Panel Aç
- `smartTerminal.autoDetect`: Terminalleri Tespit Et
- `smartTerminal.runCommand`: Komut Çalıştır (Manuel)
- `smartTerminal.autoRunCommand`: Komut Çalıştır (Otomatik)

### Keybindings
- `Ctrl+Shift+T` / `Cmd+Shift+T`: Panel Aç
- `Ctrl+Shift+D` / `Cmd+Shift+D`: Terminal Tespit

## [0.1.0] - 2025-01-01

### Added
- İlk beta sürümü
- Temel terminal tespit sistemi
- Basit komut çalıştırma

---

## Version History

- **1.0.0**: İlk stabil sürüm - Tam özellikli akıllı terminal launcher
- **0.1.0**: Beta sürümü - Temel özellikler

## Upgrade Notes

### 1.0.0'a Yükseltme
- Yeni `AutoRun` özelliği eklendi
- UI tamamen yenilendi
- Ayarlar genişletildi
- Performans iyileştirmeleri

## Known Issues

- WSL terminal tespiti bazı sistemlerde yavaş olabilir
- Özel terminal tanımlamaları için tam yol gereklidir
- VS Code Terminal API sınırlaması nedeniyle terminal çıktısı doğrudan okunamıyor

## Feedback

Geri bildirimleriniz için:
- GitHub Issues: https://github.com/ufuktanyeri/smart-terminal-launcher/issues
- Email: ufuk@example.com

---

**[Unreleased]**: https://github.com/ufuktanyeri/smart-terminal-launcher/compare/v1.0.0...HEAD
**[1.0.0]**: https://github.com/ufuktanyeri/smart-terminal-launcher/releases/tag/v1.0.0
**[0.1.0]**: https://github.com/ufuktanyeri/smart-terminal-launcher/releases/tag/v0.1.0
