import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs, Timer } from 'claude-code'

import type { Mood } from '../types'
import { makeColors } from './make-colors.js'
import { CAPY_SCENE } from './scene.js'

// Onsen stone by day, graphite at night, sticky-pink accent.
const { theme, problems } = makeColors({
  label: 'Claude Capy',
  roles: { accent: '#ff7ab0', danger: '#ff6b5b', success: '#5ccf7f', warning: '#ffc53d', pro: '#a99cff' },
  light: {
    roles: { accent: '#b0336d', danger: '#c4392f', success: '#2a7a44', warning: '#9a6a00', pro: '#5a50b8' },
    gray: {
      anchors: {
        'surface-0': '#ecebe8',
        'surface-1': '#f3f2ef',
        'surface-2': '#f9f9f7',
        'text-primary': '#1e1d1a',
        'text-secondary': '#45433d',
        'text-muted': '#5c5952',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#121314',
        'surface-1': '#18191b',
        'surface-2': '#1e2022',
        'surface-3': '#242629',
        'text-primary': '#eceef0',
        'text-secondary': '#c0c4c8',
        'text-muted': '#959ba1',
      },
    },
  },
})

// Each mood is its own scene name: a fresh scene mounts animated, while a redraw of
// the same scene was drawn frozen. So a mood change sets the look again with a new name.
const SCENE_PREFIX = 'capy-'
const look = (m: Mood): ThemeSetArgs => ({
  colors: theme,
  backdrop: { scene: SCENE_PREFIX + m, glass: { blur: 14, opacity: 0.62 } },
})

const MOODS: Record<Mood, { alt: string; status: string }> = {
  idle: { alt: 'Capy soaks in a hot tub, eyes closed', status: 'capy: soaking' },
  sleep: { alt: 'Capy dozes off, blowing a bubble', status: 'capy: zzz' },
  prompt: { alt: 'Capy perks up its ears', status: 'capy: listening' },
  think: { alt: 'Capy winks at a graph on the laptop', status: 'capy: one eye on the dashboard' },
  bash: { alt: 'Capy types on a retro terminal', status: 'capy: in the terminal' },
  edit: { alt: 'Capy edits code with a pencil behind its ear', status: 'capy: editing' },
  web: { alt: 'Capy reads the web through a magnifier', status: 'capy: researching' },
  agent: { alt: 'Helper ducks swim in', status: 'capy: sent helper ducks' },
  todo: { alt: 'Capy ticks a checklist', status: 'capy: ticking the list' },
  plan: { alt: 'Capy studies a blueprint in glasses', status: 'capy: planning' },
  ask: { alt: 'Capy tilts its head with a question', status: 'capy: has a question' },
  ok: { alt: 'Capy hums contentedly', status: 'capy: content' },
  fail: { alt: 'Capy stays calm while the laptop burns', status: 'capy: this is fine' },
  done: { alt: 'Capy earns a second yuzu', status: 'capy: second yuzu earned' },
  compact: { alt: 'Capy squeezes the context in a press', status: 'capy: compacting' },
  end: { alt: 'Capy waves goodbye', status: 'capy: bye!' },
}

// Which mood a tool call shows while it runs; any other tool keeps the current one.
const TOOL_MOODS: Record<string, Mood> = {
  Bash: 'bash',
  Edit: 'edit',
  Write: 'edit',
  NotebookEdit: 'edit',
  WebSearch: 'web',
  WebFetch: 'web',
  Agent: 'agent',
  Task: 'agent',
  TodoWrite: 'todo',
  EnterPlanMode: 'plan',
  ExitPlanMode: 'plan',
  AskUserQuestion: 'ask',
}

const SLEEP_AFTER_MS = 10 * 60 * 1000

// Change the tag if Mood changes: it declines what an earlier version stored.
const mood = atom({ plugin: 'capy-claude-theme', key: 'mood' } as const, 'idle' as Mood, { shape: 'mood-2' })

let sleepTimer: Timer | undefined

async function setMood($: EngineInterface, next: Mood, draw = true, force = false) {
  // The desktop backdrop animates for about two seconds after it mounts, then holds
  // still. So each mood is a snapshot: a real change clears the look and sets it again,
  // which mounts the new mood fresh and plays its motion once.
  if (force || (await read($, mood)) !== next) {
    await update($, mood, () => next)
    if (draw) {
      await $.theme.clear()
      await $.theme.set(look(next))
    }
  }
  $.ui.status(MOODS[next].status)

  // Any change restarts the nap clock; Capy dozes off only when nothing is running.
  sleepTimer?.cancel()
  sleepTimer = undefined
  if (next === 'idle' || next === 'done' || next === 'ok') {
    sleepTimer = $.clock.after(SLEEP_AFTER_MS, () => {
      void setMood($, 'sleep')
    })
  }
}

export const register: Register = on => {
  on('command.run', { command: 'capy' }, async ($, e) => {
    const want = e.args.trim() as Mood
    if (!(want in MOODS)) {
      return { text: `Capy moods: ${Object.keys(MOODS).join(', ')}. Try /capy plan` }
    }
    await setMood($, want, true, true)

    return { text: `Capy is now: ${want}. It plays once, then rests until the next event.` }
  })

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'capy', description: 'Show a Capy mood: /capy idle | sleep | prompt | think | bash | edit | web | agent | todo | plan | ask | ok | fail | done | compact | end' })

    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    // One set at start, then no second draw: the first mount is the one that animates.
    await update($, mood, () => 'sleep' as Mood)
    const set = await $.theme.set(look('idle'))

    if (set.isDrawn) {
      await setMood($, 'idle', false)
    } else {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await setMood($, 'prompt')

    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined) {
      await setMood($, 'think')
    }

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const during = TOOL_MOODS[e.tool]

    if (during !== undefined && (await read($, mood)) !== 'fail') {
      await setMood($, during)
    }
    const ran = await next(e)
    const hasFailed = ran.deny === undefined && ran.isError === true

    // A failure sticks until the next turn, so a later success doesn't hide it.
    // A tool with its own mood keeps it until something else happens.
    if (hasFailed) {
      await setMood($, 'fail')
    } else if (during === undefined && (await read($, mood)) !== 'fail') {
      await setMood($, 'ok')
    }

    return ran
  }).catch(($, e, next) => next(e))

  on('session.compact', async ($, e, next) => {
    if (e.agentId !== undefined) {
      return next(e)
    }
    await setMood($, 'compact')
    const compacted = await next(e)
    await setMood($, 'idle')

    return compacted
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)

    if (e.agentId === undefined && (await read($, mood)) !== 'fail') {
      await setMood($, 'done')
    }

    return done
  })

  on('session.end', async ($, e, next) => {
    await setMood($, 'end')
    sleepTimer?.cancel()

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const now = e.props.scene.slice(SCENE_PREFIX.length) as Mood
    if (!e.props.scene.startsWith(SCENE_PREFIX) || !(now in MOODS) || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={CAPY_SCENE.replace('__MOOD__', now)} alt={MOODS[now].alt} isInteractive />
  })
}
