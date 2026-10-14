# 🐰 Clover Hollow: A Three-Year Promise

A cozy, Princess Maker-style stat-raising game. You are Nimbus the sheep, looking after a young rabbit for three years.
Plan each month, grow their skills, befriend four townsfolk, find the lost town Charter, and reach one of 24 endings.
See `ENDINGS_GUIDE.md` for how to get each one (spoilers!).

Plain HTML, CSS and JavaScript. No build step, no installs.

## Put it online (GitHub Pages)

1. Create a new repository on GitHub (for example `clover-hollow`).
2. Upload **everything inside this folder** (`index.html`, `css`, `js`, `images`). Use **Add file, Upload files**,
   drag the files and folders in, then **Commit changes**. `index.html` must sit at the top level of the repo.
3. Go to **Settings, Pages**. Under Build and deployment choose **Deploy from a branch**, branch `main`, folder `/ (root)`, **Save**.
4. After a minute or two your game is live at `https://YOUR-USERNAME.github.io/clover-hollow/`. Share that link.

You can also just double-click `index.html` to play locally.
Saves and unlocked endings are stored in each player's own browser.

## Folder layout

```
index.html        the page
css/style.css     styling
js/data.js        stats, activities, events, story, endings (edit text here!)
js/engine.js      game logic and the image list
images/           artwork
```

## Images

| File | What it is |
|---|---|
| `images/rabbit.webp` | The rabbit you raise |
| `images/sheep_hi.webp`, `sheep_happy.webp`, `sheep_proud.webp` | Nimbus the sheep (3 moods) |
| `images/lion.webp` / `fox.webp` / `shiba.webp` / `cat.webp` | Gareth / Fenn / Mugi / Suzu |
| `images/bg_home.jpg`, `bg_town.jpg`, `bg_pasture.jpg` | Backgrounds |

Replace a file with a new one of the same name to swap art, or edit the `IMG` list at the top of `js/engine.js`.

## Credits

Animal illustrations: irasutoya. Backgrounds: stock images.
Please check each source's terms before making the repo public or sharing widely.
