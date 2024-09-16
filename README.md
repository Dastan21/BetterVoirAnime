# Better VoirAnime

**Better VoirAnime** is a non-official Chrome Extension for the streaming website: [Voiranime](https://voiranime.com)

# 📋 Features

- Website UI
  - Complete refound of the easthetic of the website
  - Dark theme / Light theme / Nord theme
  - Modern style
  - Proper loading screen
- Functionalities
  - Switch between themes
  - Discover random animes
  - Inside adblock
  - Continue previously watched anime
  - Data synchronisation

# 🧰 Rework

- UI
- Search
- Host
- Anime Player
- Framework

# ⚒️ Installation

Download the [latest version](https://github.com/Dastan21/BetterVoirAnime/releases/latest) and unzip it somewhere it won't move or change.

Go to the [extensions](chrome://extensions) and click on "Load unpacked". Select the unpacked files you just got and enjoy <3

**Warning**: works only on Chromium browsers!

# 📚 Feedback & Issues

You're more than welcome to report your feedback or issues with the app in [the issues section](https://github.com/Dastan21/BetterVoirAnime/issues).

# 📺 Custom episode players

You can add a custom episode player (if you want to use a custom one you made) by editing the file `public/players.json` and adding a new entry like this:

```json
[
  {
    "id": "player-id",
    "name": "My Player",
    "url": "http://url-of-the-player.com/$id"
  }
]
```

> Note that you can use the special variable `$id` in the url of the player, which will be replaced by the id of the current episode.

# 📝 TODO

- Commentary section
- Rating animes
