# Hot Standby

A Claude Code desktop theme. Capy, a capybara SRE, is on call in an onsen hot tub under a noren curtain of cloud crests, and reacts to whatever Claude is doing.

- Graphite palette with a sticky-pink accent, in light and dark mode.
- A backdrop scene: cedar hot tub, rubber duck, onsen bucket and bath stool, an "on-call: capy" sign, falling petals, and a noren with AWS, Google Cloud, Azure, Cloudflare, Vercel and Supabase crests.
- 16 moods, each drawn when its event happens, with a short motion each time the mood changes:

| Event | Capy |
| --- | --- |
| You send a prompt | ears up, "!" |
| Claude starts a turn | winks at a graph on the laptop |
| Bash | types on a retro terminal |
| Edit, Write | pencil over the ear, code editor, "+12 -3" |
| WebSearch, WebFetch | magnifier and a browser window |
| Agent | helper ducks in hard hats swim in |
| TodoWrite | ticks a clipboard |
| Plan mode | round glasses and a blueprint |
| AskUserQuestion | head tilt and a "?" bubble |
| A tool succeeds or fails | hums, or "this is fine" by a burning laptop |
| Turn complete | a second yuzu |
| Compaction | squeezes the context in a press |
| 10 quiet minutes | dozes off |
| Session end | waves bye |

`/capy <mood>` shows any mood on demand; `/capy` lists them.

## Install

At the prompt of a terminal session:

```
/plugin install hot-standby --marketplace samithiwat/hot-standby
```

From a shell:

```
claude plugin install hot-standby --marketplace samithiwat/hot-standby
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `samithiwat/hot-standby`, then Add plugin.

The backdrop draws in the desktop and mobile apps; the terminal shows the status line only.

## Notes

- Cloud and PaaS marks come from [theSVG](https://thesvg.org) (MIT). The marks themselves are trademarks of their owners and are used here only as decoration.
- The desktop app plays a backdrop's animation for a few seconds after it appears, so each mood change replays its motion once rather than looping.
