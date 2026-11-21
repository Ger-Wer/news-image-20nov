# 20 November 2026 — World News in One Image

[![make.fun · news-image-20261120](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![rank](https://make.fun/badge/news-image-20261120/Ger-Wer/news-image-20nov/rank.svg)](https://make.fun/bounty/news-image-20261120/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![reward](https://make.fun/badge/news-image-20261120/Ger-Wer/news-image-20nov/reward.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)

One 1024×1024 image summing up Friday 20 November 2026, drawn as a newspaper
front page: Russian missiles fell in Poland; a massive Russian strike hit Kyiv;
US stocks fell into correction; a missile hit Riyadh's tallest tower; a strong
earthquake shook central Peru.

Contest: https://make.fun/bounty/news-image-20261120

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The image is drawn by `gen.mjs` (pure Node.js, standard library only, with its
own PNG encoder) and copied to `$MAKEFUN_OUTPUT_DIR/entry.png` by `main.ts`.
Running it twice produces byte-identical output.
