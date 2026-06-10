# 💸 SplitMate

Kosten slim verdelen met vrienden — installeerbare PWA.

## 🚀 Deployen naar GitHub Pages (eenmalig)

### 1. Repo aanmaken op GitHub

1. Ga naar [github.com/new](https://github.com/new)
2. Naam: `splitmate` (exact zo — anders moet je `vite.config.js` aanpassen)
3. Zet op **Public**
4. Klik **Create repository**

### 2. Code uploaden

```bash
git clone https://github.com/JOUW-GEBRUIKERSNAAM/splitmate.git
# Kopieer alle bestanden van dit project naar die map
cd splitmate
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. GitHub Pages inschakelen

1. Ga naar je repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Sla op

De GitHub Action runt automatisch bij elke push en deployt naar:
```
https://JOUW-GEBRUIKERSNAAM.github.io/splitmate/
```

---

## 📱 Installeren op je gsm

### Android (Chrome)
1. Open de URL in Chrome
2. Tik op het menu (⋮) → **"Toevoegen aan startscherm"**
3. Of wacht op de installatie-banner onderin

### iPhone (Safari)
1. Open de URL in **Safari** (niet Chrome)
2. Tik op het deelknopje (□↑)
3. Scroll naar beneden → **"Zet op beginscherm"**
4. Tik **Voeg toe**

De app werkt daarna volledig offline als native app.

---

## 🔧 Lokaal ontwikkelen

```bash
npm install
npm run dev
```

Open dan [http://localhost:5173/splitmate/](http://localhost:5173/splitmate/)

---

## 💾 Data opslag

Alle data wordt opgeslagen in `localStorage` van je browser/app.  
**Data gaat niet verloren** tenzij je de browser cache volledig wist.

> Tip: Als je de app installeert als PWA, heeft die zijn eigen geïsoleerde storage — los van je browser.

---

## ⚙️ Andere repo-naam?

Pas de `base` in `vite.config.js` aan:
```js
base: '/JOUW-REPO-NAAM/',
```
En update `index.html` (alle `/splitmate/` paden).
