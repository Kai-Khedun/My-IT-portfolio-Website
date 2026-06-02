# [Your Name] — IT Portfolio

A Berserk-inspired, GSAP-animated portfolio. Pure HTML / CSS / JS — no build step.

---

## 1. What you have

```
My IT portfolio Website/
├── index.html          ← page structure & content (EDIT THIS for your info)
├── css/styles.css      ← all styling
├── js/main.js          ← all animations + cursor + easter egg
├── assets/             ← drop project screenshots here
├── vercel.json         ← Vercel config (security headers)
├── .gitignore
└── README.md           ← you are here
```

Everything you need to edit lives in **`index.html`**. Search for `[` to find every placeholder (`[Your Name]`, `[Project One]`, `[your-email@example.com]`, etc).

---

## 2. Edit it locally in VS Code

1. Open VS Code → `File` → `Open Folder` → select `E:\Portfolio Website\My IT portfolio Website`.
2. Install the extension **"Live Server"** by Ritwick Dey (one-time).
3. Right-click `index.html` → **"Open with Live Server"**. The site opens in your browser and auto-reloads as you edit.
4. Replace every `[bracketed placeholder]` in `index.html` with your real info.

### Easter eggs (don't tell the recruiters)
- Click the small red Behelit bead at the bottom of the Contact section → Eclipse triggers.
- Or type the word **`sacrifice`** anywhere on the page.

---

## 3. Put it on GitHub

Open **VS Code's terminal** (`Ctrl + ` `` ` ``) and run, one block at a time:

```bash
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
```

Then go to https://github.com/new and create a **public** repo named `portfolio` (no README, no .gitignore — it's already in this folder). On the next page GitHub shows commands; ignore them and use these instead, replacing `YOUR-USERNAME`:

```bash
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
git push -u origin main
```

Done. Your code is on GitHub.

---

## 4. Deploy on Vercel (free, always online)

1. Go to https://vercel.com → **Sign Up** → choose **Continue with GitHub**.
2. After login, click **Add New… → Project**.
3. Find `portfolio` in the repo list → click **Import**.
4. Framework Preset: leave as **Other**. Build Command: leave blank. Output Directory: leave blank. Root Directory: leave as `./`.
5. Click **Deploy**.

About 30 seconds later you'll get a live URL like `https://portfolio-abc123.vercel.app`. Share that with companies.

### Every future update
Save a change in VS Code, then in the terminal:

```bash
git add .
git commit -m "describe the change"
git push
```

Vercel rebuilds automatically. New version is live in ~30 seconds.

---

## 5. Optional: custom domain (e.g. `yourname.dev`)

1. Buy a domain on Cloudflare (~$10/year — cheapest, no upsells).
2. In Vercel → your project → **Settings** → **Domains** → add your domain.
3. Vercel tells you which records to add at your registrar. Add them. Wait ~5 minutes.

---

## 6. Quick edit cheat sheet

| You want to change | Open this file | Find this |
|---|---|---|
| Your name everywhere | `index.html` | `[Your Name]` |
| The page title in browser tabs | `index.html` | `<title>` |
| About section bio | `index.html` | `id="about"` |
| Skills list | `index.html` | `id="skills"` |
| Projects | `index.html` | `id="projects"` |
| Experience / timeline | `index.html` | `id="experience"` |
| Email + social links | `index.html` | `id="contact"` |
| Colors (crimson, gold, etc) | `css/styles.css` | `:root` at the top |
| Animation timings | `js/main.js` | function names like `setupSplash` |

To swap a project cover image: drop `myproject.jpg` into `assets/`, then in the relevant `<div class="project__cover">` add `style="background-image:url('assets/myproject.jpg'); background-size:cover;"`.

---

## 7. Troubleshooting

- **Animations don't fire** → check the browser console (F12). Usually a typo in `index.html` near a `data-reveal` attribute.
- **Custom cursor missing** → it's intentionally hidden on touch devices. Try a mouse.
- **GitHub push asks for password** → use a Personal Access Token. https://github.com/settings/tokens → Generate new (classic) → check `repo` → use the token as the password.
- **Vercel says "no Output Directory"** → leave all build settings blank. This is a static site.

Built in the dark. ⚔
