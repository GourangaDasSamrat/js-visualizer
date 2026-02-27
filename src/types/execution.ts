export type PhaseType =
  | 'init'
  | 'push_context'
  | 'pop_context'
  | 'push_stack'
  | 'pop_stack'
  | 'web_api'
  | 'task_queue'
  | 'microtask_queue'
  | 'event_loop'
  | 'resolve_promise'
  | 'highlight_line'
  | 'log_output'
  | 'complete';

export interface ExecutionFrame {
  id: string;
  name: string;
  type: 'global' | 'function' | 'arrow' | 'async';
  variables: Record<string, string>;
  line: number;
}

export interface CallStackEntry {
  id: string;
  name: string;
  line: number;
  type: 'sync' | 'async';
}

export interface WebApiEntry {
  id: string;
  name: string;
  delay?: number;
  type: 'setTimeout' | 'setInterval' | 'fetch' | 'promise' | 'event';
  status: 'pending' | 'resolving' | 'resolved';
}

export interface QueueEntry {
  id: string;
  name: string;
  source: string;
  type: 'macro' | 'micro';
}

export interface ExecutionStep {
  id: string;
  stepIndex: number;
  description: string;
  phase: PhaseType;
  activeLine: number;
  callStack: CallStackEntry[];
  executionContext: ExecutionFrame[];
  webApis: WebApiEntry[];
  taskQueue: QueueEntry[];
  microtaskQueue: QueueEntry[];
  consoleOutput: string[];
  eventLoopActive: boolean;
  highlight?: {
    from: number;
    to: number;
  };
  changes: StepChange[];
}

export interface StepChange {
  type:
    | 'stack_push'
    | 'stack_pop'
    | 'context_push'
    | 'context_pop'
    | 'web_api_add'
    | 'web_api_resolve'
    | 'task_enqueue'
    | 'task_dequeue'
    | 'microtask_enqueue'
    | 'microtask_dequeue'
    | 'console_log'
    | 'event_loop_tick';
  target?: string;
  value?: string;
}

export interface ParsedCode {
  raw: string;
  lines: string[];
  ast: ASTNode[];
}

export interface ASTNode {
  type: string;
  line: number;
  name?: string;
  async?: boolean;
  children?: ASTNode[];
}
