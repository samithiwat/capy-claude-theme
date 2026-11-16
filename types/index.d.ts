export type Mood =
  | 'idle' | 'sleep' | 'prompt' | 'think' | 'bash' | 'edit' | 'web' | 'agent'
  | 'todo' | 'plan' | 'ask' | 'ok' | 'fail' | 'done' | 'compact' | 'end'

declare module 'claude-code' {
  interface PluginState {
    'capy-claude-theme': { mood: Shaped<Mood> }
  }
}
