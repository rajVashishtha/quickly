# Quickly — Multi-Connection CLI Downloader

A fast, resilient, multi-connection file downloader for Node.js inspired by tools like FDM/IDM.

Quickly splits files into chunks and downloads them in parallel with resume support, retries, and live progress tracking.

---

## ✨ Features

* ⚡ Multi-connection downloading (parallel chunk downloads)
* ♻️ Resume partially downloaded files
* 🔁 Automatic retry per chunk
* 📊 Live progress bar with speed + ETA
* 🧠 Smart chunk splitting based on file size
* 🧵 Connection pooling (prevents too many sockets)
* 🧾 Verbose debug mode
* 🔗 Automatic fallback if server doesn't support range requests

---

## Demo (npx)

```
npx @raj-vashisht/quickly https://speed.hetzner.de/100MB.bin test.bin --verbose --connections 5 --retry 3
```

## 📦 Installation

Clone the repo:

```bash
git clone https://github.com/yourname/quickly.git
cd quickly
```

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Make CLI globally available (optional):

```bash
npm link
```

Now you can use the `quickly` command anywhere.

---

## 🚀 Usage

```bash
quickly <url> [output] [options]
```

### Basic download

```bash
quickly https://example.com/file.zip
```

### Custom output filename

```bash
quickly https://example.com/file.zip myfile.zip
```

---

## ⚙️ Options

| Option                       | Description              | Default |
| ---------------------------- | ------------------------ | ------- |
| `-c, --connections <number>` | Max parallel connections | 5       |
| `-r, --retries <number>`     | Retries per chunk        | 3       |
| `-v, --verbose`              | Show detailed logs       | off     |

---

### Examples

**Download with 2 connections**

```bash
quickly https://example.com/file.iso -c 2
```

**Increase retries**

```bash
quickly https://example.com/file.iso -r 5
```

**Verbose mode**

```bash
quickly https://example.com/file.iso -v
```

---

## 📊 How It Works

1. Fetch file size + check if server supports range requests.
2. Split file into chunks.
3. Start a worker pool (limited parallel connections).
4. Download chunks concurrently.
5. Track global progress, speed, and ETA.
6. Merge chunks into final file.

If the server doesn’t support range requests, Quickly automatically falls back to single-connection download.

---

## 🧠 Resume Support

If download stops mid-way:

```bash
quickly <some-url> <some-output>
```

Previously downloaded chunks will resume automatically.

---

## 📈 Progress Bar

```
⬇️ ████████████ 78% | 780MB/1GB | 12MB/s | ETA 18s
```

Verbose mode also shows per-chunk logs.

---

## 🛠 Tech Stack

* Node.js
* Undici (HTTP client)
* Commander (CLI framework)
* cli-progress (progress bar)
* Chalk (colored logs)

---

## 🧪 Dev Scripts

```bash
npm run dev     # run in dev mode
npm run build   # build TypeScript
npm run start   # run built CLI
```

---

## 🔮 Roadmap

* Pause / Resume across app restarts
* Download queue (multiple files)
* Mirror download support
* Per-chunk speed statistics
* Config file support

---

## 🤝 Contributing

PRs welcome!
Feel free to open issues for feature requests or bugs.

---

## 📄 License

MIT License

