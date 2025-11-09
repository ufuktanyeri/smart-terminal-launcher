# Smart Terminal Launcher - VS Code Extension
## Geliştirme Adımları

### ✅ TAMAMLANAN
- [x] D:\VSCode-Projects dizini oluşturuldu
- [x] smart-terminal-launcher projesi oluşturuldu
- [x] npm init yapıldı
- [x] package.json VS Code extension için yapılandırıldı
- [x] tsconfig.json oluşturuldu
- [x] Proje klasör yapısı oluşturuldu (src/, media/, test/)
- [x] .vscodeignore dosyası oluşturuldu
- [x] README.md oluşturuldu
- [x] LICENSE oluşturuldu (MIT)
- [x] CHANGELOG.md oluşturuldu
- [x] src/extension.ts oluşturuldu (ana entry point)
- [x] src/terminalDetector.ts oluşturuldu (terminal tespit sistemi)
- [x] src/commandAnalyzer.ts oluşturuldu (switch-case komut analizi)
- [x] src/terminalLauncher.ts oluşturuldu (terminal başlatma)
- [x] src/configManager.ts oluşturuldu (kullanıcı ayarları)
- [x] src/statisticsCollector.ts oluşturuldu (istatistik toplama)
- [x] src/webview/panelProvider.ts oluşturuldu (webview yönetimi)
- [x] src/webview/panel.html oluşturuldu (UI - panelProvider içinde)
- [x] src/webview/panel.css oluşturuldu (Excel tasarımına göre)
- [x] src/webview/panel.js oluşturuldu (frontend logic)

### 📋 YAPILACAKLAR

#### FAZA 1: Proje Yapısı ve Temel Kurulum ✅ TAMAMLANDI
- [x] package.json'ı VS Code extension için yapılandır
- [x] tsconfig.json oluştur
- [x] Proje klasör yapısını oluştur (src/, media/, test/)
- [x] TypeScript ve gerekli bağımlılıkları yükle (VS Code Terminal API kullanılıyor)
- [x] .vscodeignore dosyası oluştur

#### FAZA 2: Terminal Tespit Sistemi ✅ TAMAMLANDI
- [x] src/terminalDetector.ts oluştur
- [x] Windows terminal tespiti (PowerShell, CMD, Git Bash, WSL)
- [x] Registry kontrolü ekle (placeholder)
- [x] PATH tarama sistemi ekle
- [x] Özel kurulum dizinlerini tara

#### FAZA 3: Komut Analiz Sistemi (Switch-Case) ✅ TAMAMLANDI
- [x] src/commandAnalyzer.ts oluştur
- [x] Komut tiplerini tespit et (npm, git, python, docker vb.)
- [x] Switch-case yapısı ile terminal eşleştirme (50+ komut tipi)
- [x] Kullanıcı tercihlerini entegre et

#### FAZA 4: Webview Panel UI ✅ TAMAMLANDI
- [x] src/webview/panelProvider.ts oluştur
- [x] src/webview/panel.html oluştur (Excel tasarımına göre)
- [x] src/webview/panel.css oluştur
- [x] src/webview/panel.js oluştur
- [x] Current dropdown (mevcut terminaller)
- [x] Unavailable dropdown (multi-choice)
- [x] Recommended dropdown (multi-choice)
- [x] Checkbox seçenekleri (Bash, PowerShell vb.)
- [x] Komut giriş alanı
- [x] **RUN butonu** (manuel terminal seçimi)
- [x] **AUTORUN butonu** (otomatik terminal seçimi)
- [x] Terminal çıktı alanı
- [x] Autodetect Terminals butonu

#### FAZA 5: Terminal Launcher ✅ TAMAMLANDI
- [x] src/terminalLauncher.ts oluştur
- [x] Terminal başlatma fonksiyonu
- [x] Komut çalıştırma sistemi
- [x] Çıktı yakalama ve gösterme (VS Code API sınırlaması ile)
- [x] Hata yönetimi

#### FAZA 6: Kullanıcı Ayarları ✅ TAMAMLANDI
- [x] src/configManager.ts oluştur
- [x] package.json'a configuration ekle
- [x] Varsayılan terminal ayarı
- [x] Otomatik tespit ayarı
- [x] Terminal öncelik ayarları
- [x] İstatistik toplama ayarı (opt-in)

#### FAZA 7: OS'a Göre Öneri Sistemi ✅ TAMAMLANDI
- [x] terminalDetector.ts içinde implement edildi
- [x] Windows için öneriler (PowerShell, Git Bash, WSL, CMD sırası)
- [x] Proje tipi analizi (commandAnalyzer içinde)
- [x] Y/n onay sistemi (configManager içinde)

#### FAZA 8: İstatistik Toplama (Gizlilik Odaklı) ✅ TAMAMLANDI
- [x] src/statisticsCollector.ts oluştur
- [x] Anonim veri toplama
- [x] Kullanıcı onayı kontrolü
- [x] Gizlilik politikası (README'de)

#### FAZA 9: Ana Extension Dosyası ✅ TAMAMLANDI
- [x] src/extension.ts oluştur
- [x] activate() fonksiyonu
- [x] deactivate() fonksiyonu
- [x] Komutları kaydet
- [x] Kısayol tuşlarını tanımla

#### FAZA 10: Test ve Dokümantasyon
- [ ] test/suite/extension.test.ts oluştur
- [ ] test/suite/terminalDetector.test.ts oluştur
- [x] README.md detaylı kılavuz
- [x] CHANGELOG.md oluştur
- [x] LICENSE dosyası (MIT)
- [ ] Icon tasarımı (128x128 PNG)
- [ ] Screenshot'lar hazırla

#### FAZA 11: Bağımlılık Sorunu Çözümü ✅ TAMAMLANDI
- [x] VS Code Terminal API kullanılıyor (node-pty'ye ihtiyaç yok)
- [x] npm install'ı başarıyla tamamla
- [x] TypeScript derlemesini test et

#### FAZA 12: Test ve Debug
- [ ] Extension'ı VS Code'da test et (F5)
- [ ] Terminal tespitini test et
- [ ] AutoRun fonksiyonunu test et
- [ ] Run fonksiyonunu test et
- [ ] UI'ı test et

#### FAZA 13: Yayınlama
- [ ] Extension'ı test et
- [ ] VSIX paketi oluştur
- [ ] VS Code Marketplace'e yayınla

---

## ÖNEMLİ NOTLAR

### Run vs AutoRun Farkı:
- **RUN**: Kullanıcının dropdown'dan seçtiği terminalde komutu çalıştırır
- **AUTORUN**: Komut analiz sistemi devreye girer, komuta göre en uygun terminali otomatik seçer ve çalıştırır

### UI Tasarımı (Excel'e göre):
```
[Current dropdown*]
[Unavailable dropdown* by multi-choice]
[Recommended dropdown* by multi-choice]

* ☐ Bash ☐ PowerShell etc.

[Instruction] [here] [Terminals] [here]
[RUN] [AUTORUN]

// instructions follow
[Terminal Output Area]
```

### Teknoloji Stack:
- TypeScript
- VS Code Extension API
- VS Code Terminal API (vscode.window.createTerminal)
- Node.js

---

**Şu Anki Durum:** Proje dizini oluşturuldu, npm init yapıldı
**Sonraki Adım:** package.json'ı VS Code extension için yapılandır
