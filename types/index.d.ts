export type Mood =
  | 'idle' | 'sleep' | 'prompt' | 'think' | 'bash' | 'edit' | 'web' | 'agent'
  | 'todo' | 'plan' | 'ask' | 'ok' | 'fail' | 'done' | 'compact' | 'end'

declare module 'claude-code' {
  interface PluginState {
    'hot-standby': { mood: Shaped<Mood> }
  }
}
