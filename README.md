# 🚀 Smart Terminal Launcher

VS Code için akıllı terminal seçici ve komut çalıştırıcı eklentisi. Komutlarınızı analiz eder ve en uygun terminalde otomatik olarak çalıştırır.

## ✨ Özellikler

### 🎯 Akıllı Terminal Seçimi
- **AutoRun**: Komutunuzu analiz eder ve en uygun terminali otomatik seçer
- **Run**: Manuel olarak seçtiğiniz terminalde çalıştırır
- Komut tipine göre akıllı eşleştirme (npm → PowerShell, git → Git Bash vb.)

### 🔍 Otomatik Terminal Tespiti
- PowerShell
- Command Prompt (CMD)
- Git Bash
- WSL (Windows Subsystem for Linux)
- Özel terminal tanımlamaları

### 🎨 Kullanıcı Dostu Arayüz
- **Current**: Mevcut yüklü terminaller
- **Unavailable**: Eksik terminaller (çoklu seçim)
- **Recommended**: OS'a göre önerilen terminaller (çoklu seçim)
- Gerçek zamanlı komut çıktısı
- Kolay terminal yönetimi

### ⚙️ Özelleştirilebilir Ayarlar
- Varsayılan terminal seçimi
- Komut tiplerine göre terminal öncelikleri
- Otomatik tespit ayarları
- Özel terminal tanımlamaları

### 📊 İstatistikler (Opsiyonel)
- Gizlilik odaklı, anonim veri toplama
- Kullanım istatistikleri
- Opt-in (kullanıcı onayı gerekli)

## 📦 Kurulum

### VS Code Marketplace'den
1. VS Code'u açın
2. Extensions paneline gidin (Ctrl+Shift+X)
3. "Smart Terminal Launcher" arayın
4. Install butonuna tıklayın

### Manuel Kurulum
1. `.vsix` dosyasını indirin
2. VS Code'da Extensions paneline gidin
3. "..." menüsünden "Install from VSIX..." seçin
4. İndirdiğiniz dosyayı seçin

## 🚀 Kullanım

### Panel Açma
- **Kısayol**: `Ctrl+Shift+T` (Windows/Linux) veya `Cmd+Shift+T` (Mac)
- **Komut Paleti**: `Smart Terminal: Panel Aç`

### Komut Çalıştırma

#### AutoRun (Otomatik)
1. Komutunuzu girin
2. **AutoRun** butonuna tıklayın
3. Sistem komutu analiz eder ve en uygun terminali seçer
4. Onay verin (ayarlarda kapatılabilir)
5. Komut otomatik olarak çalışır

#### Run (Manuel)
1. Komutunuzu girin
2. Terminal dropdown'dan istediğiniz terminali seçin
3. **Run** butonuna tıklayın
4. Komut seçili terminalde çalışır

### Terminal Tespiti
- **Otomatik**: VS Code başlangıcında otomatik tespit
- **Manuel**: `Ctrl+Shift+D` veya "Autodetect Terminals" butonu

## 🎯 Komut Eşleştirme Örnekleri

| Komut Tipi | Önerilen Terminal |
|------------|-------------------|
| npm, node, yarn | PowerShell |
| git | Git Bash |
| python, pip | CMD |
| docker, kubectl | PowerShell |
| bash, sh | Git Bash |
| wsl, linux | WSL |

## ⚙️ Ayarlar

### Varsayılan Terminal
```json
{
  "smartTerminal.defaultTerminal": "PowerShell"
}
```

### Terminal Öncelikleri
```json
{
  "smartTerminal.terminalPriority": {
    "npm": "PowerShell",
    "git": "Git Bash",
    "python": "CMD"
  }
}
```

### Otomatik Tespit
```json
{
  "smartTerminal.autoDetectOnStartup": true
}
```

### Özel Terminal Tanımlama
```json
{
  "smartTerminal.customTerminals": [
    {
      "name": "Cmder",
      "path": "C:\\cmder\\Cmder.exe",
      "args": ["/START", "%USERPROFILE%"]
    }
  ]
}
```

### AutoRun Onayı
```json
{
  "smartTerminal.autoRunConfirmation": true
}
```

### İstatistikler (Opt-in)
```json
{
  "smartTerminal.enableStatistics": false
}
```

## 🎨 UI Bileşenleri

### Dropdown'lar
- **Current**: Sistemde yüklü terminaller
- **Unavailable**: Tespit edilemeyen terminaller (kurulum önerileri)
- **Recommended**: OS'a göre önerilen terminaller

### Butonlar
- **Run**: Manuel terminal seçimi ile çalıştır
- **AutoRun**: Otomatik terminal seçimi ile çalıştır
- **Autodetect Terminals**: Terminal tespitini yeniden çalıştır

### Çıktı Alanı
- Gerçek zamanlı komut çıktısı
- Renkli terminal emülasyonu
- Scroll desteği
- Kopyala-yapıştır

## 🔧 Geliştirme

### Gereksinimler
- Node.js 18+
- npm veya yarn
- VS Code 1.80+

### Kurulum
```bash
git clone https://github.com/ufuktanyeri/smart-terminal-launcher.git
cd smart-terminal-launcher
npm install
```

### Derleme
```bash
npm run compile
```

### Test
```bash
npm test
```

### Debug
1. VS Code'da projeyi açın
2. F5'e basın
3. Extension Development Host açılır

### Paketleme
```bash
npm run package
```

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🐛 Hata Bildirimi

Hata bulduysanız veya öneriniz varsa [GitHub Issues](https://github.com/ufuktanyeri/smart-terminal-launcher/issues) üzerinden bildirebilirsiniz.

## 📧 İletişim

- GitHub: [@ufuktanyeri](https://github.com/ufuktanyeri)
- Email: ufuk@example.com

## 🙏 Teşekkürler

Bu projeyi kullandığınız için teşekkürler! ⭐ vermeyi unutmayın.

---

**Made with ❤️ by Ufuk Tanyeri**
