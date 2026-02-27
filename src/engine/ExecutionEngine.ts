import type {
  ExecutionStep,
  CallStackEntry,
  ExecutionFrame,
  WebApiEntry,
  QueueEntry,
  StepChange,
} from '../types/execution';

let stepIdCounter = 0;
const nextId = () => `id_${stepIdCounter++}`;

export class ExecutionEngine {
  private steps: ExecutionStep[] = [];
  private callStack: CallStackEntry[] = [];
  private executionContext: ExecutionFrame[] = [];
  private webApis: WebApiEntry[] = [];
  private taskQueue: QueueEntry[] = [];
  private microtaskQueue: QueueEntry[] = [];
  private consoleOutput: string[] = [];
  private code = '';  // kept for future use / WASM integration
  private lines: string[] = [];

  constructor() {
    stepIdCounter = 0;
  }

  analyze(code: string): ExecutionStep[] {
    this.code = code;
    this.lines = code.split('\n');
    this.steps = [];
    this.callStack = [];
    this.executionContext = [];
    this.webApis = [];
    this.taskQueue = [];
    this.microtaskQueue = [];
    this.consoleOutput = [];

    this.simulateExecution();
    return this.steps;
  }

  private snapshot(
    description: string,
    activeLine: number,
    changes: StepChange[] = [],
    eventLoopActive = false
  ): void {
    this.steps.push({
      id: nextId(),
      stepIndex: this.steps.length,
      description,
      phase: changes[0]?.type?.startsWith('event_loop') ? 'event_loop' : 'highlight_line',
      activeLine,
      callStack: this.callStack.map((e) => ({ ...e })),
      executionContext: this.executionContext.map((f) => ({
        ...f,
        variables: { ...f.variables },
      })),
      webApis: this.webApis.map((a) => ({ ...a })),
      taskQueue: this.taskQueue.map((q) => ({ ...q })),
      microtaskQueue: this.microtaskQueue.map((q) => ({ ...q })),
      consoleOutput: [...this.consoleOutput],
      eventLoopActive,
      changes,
    });
  }

  private pushStack(name: string, line: number, type: 'sync' | 'async' = 'sync') {
    const entry: CallStackEntry = { id: nextId(), name, line, type };
    this.callStack.push(entry);
    return entry;
  }

  private popStack() {
    return this.callStack.pop();
  }

  private pushContext(name: string, type: ExecutionFrame['type'], line: number) {
    const frame: ExecutionFrame = { id: nextId(), name, type, variables: {}, line };
    this.executionContext.push(frame);
    return frame;
  }

  private popContext() {
    return this.executionContext.pop();
  }

  private addWebApi(name: string, type: WebApiEntry['type'], delay?: number): WebApiEntry {
    const entry: WebApiEntry = {
      id: nextId(),
      name,
      type,
      delay,
      status: 'pending',
    };
    this.webApis.push(entry);
    return entry;
  }

  private resolveWebApi(id: string) {
    const api = this.webApis.find((a) => a.id === id);
    if (api) api.status = 'resolved';
  }

  private removeWebApi(id: string) {
    this.webApis = this.webApis.filter((a) => a.id !== id);
  }

  private enqueueTask(name: string, source: string) {
    const entry: QueueEntry = { id: nextId(), name, source, type: 'macro' };
    this.taskQueue.push(entry);
    return entry;
  }

  private enqueueMicrotask(name: string, source: string) {
    const entry: QueueEntry = { id: nextId(), name, source, type: 'micro' };
    this.microtaskQueue.push(entry);
    return entry;
  }

  private simulateExecution() {
    // Step 1: Global execution context
    const globalFrame = this.pushContext('Global Execution Context', 'global', 0);
    const mainEntry = this.pushStack('main()', 0, 'sync');
    this.snapshot(
      'JavaScript engine starts. Global Execution Context is created and pushed onto the Call Stack.',
      0,
      [
        { type: 'context_push', target: globalFrame.id, value: 'Global Execution Context' },
        { type: 'stack_push', target: mainEntry.id, value: 'main()' },
      ]
    );

    try {
      this.parseAndSimulate();
    } catch {
      // graceful fallback
      this.simulateFallback();
    }

    // Drain microtasks
    this.drainMicrotasks();

    // Event loop ticks
    this.processEventLoop();

    // Pop global
    this.popStack();
    this.popContext();
    this.snapshot('Execution complete. Call Stack is empty. Program has finished.', -1, [
      { type: 'stack_pop', target: 'main()' },
      { type: 'context_pop', target: 'Global Execution Context' },
    ]);
  }

  private parseAndSimulate() {
    const lines = this.lines;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('//')) continue;

      const lineNum = i + 1;

      // Variable declaration
      if (/^(const|let|var)\s+(\w+)\s*=/.test(line)) {
        const match = line.match(/^(const|let|var)\s+(\w+)\s*=\s*(.+?)(?:;)?$/);
        if (match) {
          const varName = match[2];
          const varValue = match[3].substring(0, 30);
          const frame = this.executionContext[this.executionContext.length - 1];
          if (frame) frame.variables[varName] = varValue;
          this.snapshot(
            `Line ${lineNum}: Variable \`${varName}\` is declared and initialized.`,
            lineNum,
            [{ type: 'context_push', value: `${varName} = ${varValue}` }]
          );
        }
        continue;
      }

      // Function declaration
      if (/^(async\s+)?function\s+(\w+)/.test(line)) {
        const match = line.match(/^(async\s+)?function\s+(\w+)/);
        if (match) {
          const funcName = match[2];
          const frame = this.executionContext[this.executionContext.length - 1];
          if (frame) frame.variables[funcName] = 'ƒ()';
          this.snapshot(
            `Line ${lineNum}: Function \`${funcName}\` is hoisted and stored in memory.`,
            lineNum,
            [{ type: 'context_push', value: `${funcName} = ƒ()` }]
          );
        }
        continue;
      }

      // console.log
      if (line.includes('console.log')) {
        const match = line.match(/console\.log\((.+?)\)(?:;)?$/);
        const args = match ? match[1] : '...';
        this.consoleOutput.push(`> ${args}`);
        this.snapshot(
          `Line ${lineNum}: \`console.log(${args})\` executes synchronously and outputs to console.`,
          lineNum,
          [{ type: 'console_log', value: args }]
        );
        continue;
      }

      // setTimeout
      if (line.includes('setTimeout')) {
        const match = line.match(/setTimeout\(.*?,\s*(\d+)/);
        const delay = match ? parseInt(match[1]) : 0;
        const cbName = `setTimeout callback (${delay}ms)`;

        const apiEntry = this.addWebApi(cbName, 'setTimeout', delay);
        const stackEntry = this.pushStack('setTimeout()', lineNum, 'sync');
        this.snapshot(
          `Line ${lineNum}: \`setTimeout\` is called. The callback is handed off to the Web APIs environment with a ${delay}ms timer.`,
          lineNum,
          [
            { type: 'stack_push', target: stackEntry.id, value: 'setTimeout()' },
            { type: 'web_api_add', target: apiEntry.id, value: cbName },
          ]
        );

        this.popStack();
        this.snapshot(
          `\`setTimeout()\` returns immediately. It's popped off the Call Stack. The timer continues in Web APIs.`,
          lineNum,
          [{ type: 'stack_pop', target: 'setTimeout()' }]
        );

        // Schedule resolution
        const taskEntry = this.enqueueTask(cbName, 'setTimeout');
        this.resolveWebApi(apiEntry.id);
        this.snapshot(
          `Timer (${delay}ms) expires in Web APIs. Callback is moved to the Task Queue (Macro Queue).`,
          lineNum,
          [
            { type: 'web_api_resolve', target: apiEntry.id },
            { type: 'task_enqueue', target: taskEntry.id, value: cbName },
          ]
        );
        continue;
      }

      // Promise / async
      if (line.includes('new Promise') || line.includes('Promise.resolve')) {
        const promiseName = 'Promise';
        const apiEntry = this.addWebApi(promiseName, 'promise');
        const stackEntry = this.pushStack('Promise()', lineNum, 'async');
        this.snapshot(
          `Line ${lineNum}: A new \`Promise\` is created. The executor function runs synchronously.`,
          lineNum,
          [
            { type: 'stack_push', target: stackEntry.id, value: 'Promise()' },
            { type: 'web_api_add', target: apiEntry.id, value: 'Promise' },
          ]
        );

        this.popStack();
        const microtask = this.enqueueMicrotask('.then() callback', 'Promise');
        this.resolveWebApi(apiEntry.id);
        this.snapshot(
          `Promise resolves. \`.then()\` callback is pushed to the Microtask Queue — higher priority than the Task Queue.`,
          lineNum,
          [
            { type: 'stack_pop', value: 'Promise()' },
            { type: 'microtask_enqueue', target: microtask.id, value: '.then() callback' },
          ]
        );
        continue;
      }

      // async/await
      if (line.includes('await')) {
        const match = line.match(/await\s+(.+?)(?:;)?$/);
        const expr = match ? match[1] : 'promise';
        const stackEntry = this.pushStack(`await ${expr}`, lineNum, 'async');
        this.snapshot(
          `Line ${lineNum}: \`await\` is encountered. The async function is suspended. Control returns to the caller.`,
          lineNum,
          [{ type: 'stack_push', target: stackEntry.id, value: `await ${expr}` }]
        );

        this.popStack();
        const microtask = this.enqueueMicrotask('async resume callback', 'await');
        this.snapshot(
          `Awaited value resolves. Resume callback is queued in the Microtask Queue.`,
          lineNum,
          [
            { type: 'stack_pop', value: `await ${expr}` },
            { type: 'microtask_enqueue', target: microtask.id, value: 'async resume callback' },
          ]
        );
        continue;
      }

      // fetch
      if (line.includes('fetch(')) {
        const apiEntry = this.addWebApi('fetch() network request', 'fetch');
        const stackEntry = this.pushStack('fetch()', lineNum, 'async');
        this.snapshot(
          `Line ${lineNum}: \`fetch()\` is called. The HTTP request is delegated to the browser's Web API (network layer).`,
          lineNum,
          [
            { type: 'stack_push', target: stackEntry.id, value: 'fetch()' },
            { type: 'web_api_add', target: apiEntry.id, value: 'fetch() network request' },
          ]
        );

        this.popStack();
        this.snapshot(
          `\`fetch()\` returns a Promise immediately. The network request continues asynchronously in Web APIs.`,
          lineNum,
          [{ type: 'stack_pop', value: 'fetch()' }]
        );

        this.resolveWebApi(apiEntry.id);
        const microtask = this.enqueueMicrotask('fetch response handler', 'fetch');
        this.snapshot(
          `Network request completes. Response handler is queued in the Microtask Queue.`,
          lineNum,
          [
            { type: 'web_api_resolve', target: apiEntry.id },
            { type: 'microtask_enqueue', target: microtask.id, value: 'fetch response handler' },
          ]
        );
        continue;
      }

      // Regular function call
      const funcCallMatch = line.match(/^(\w+)\s*\(/);
      if (funcCallMatch && !line.startsWith('//') && !line.startsWith('const') && !line.startsWith('let') && !line.startsWith('var')) {
        const funcName = funcCallMatch[1];
        if (['if', 'for', 'while', 'return', 'else'].includes(funcName)) continue;

        const funcFrame = this.pushContext(`${funcName}()`, 'function', lineNum);
        const stackEntry = this.pushStack(`${funcName}()`, lineNum, 'sync');
        this.snapshot(
          `Line ${lineNum}: \`${funcName}()\` is called. A new Execution Context is created and pushed onto the Call Stack.`,
          lineNum,
          [
            { type: 'stack_push', target: stackEntry.id, value: `${funcName}()` },
            { type: 'context_push', target: funcFrame.id, value: `${funcName}()` },
          ]
        );

        // Simulate function body
        this.snapshot(
          `Inside \`${funcName}()\`: function body executes synchronously.`,
          lineNum,
          []
        );

        this.popStack();
        this.popContext();
        this.snapshot(
          `\`${funcName}()\` returns. Its Execution Context and Call Stack frame are both removed.`,
          lineNum,
          [
            { type: 'stack_pop', value: `${funcName}()` },
            { type: 'context_pop', value: `${funcName}()` },
          ]
        );
        continue;
      }

      // Generic line
      if (line.length > 0) {
        this.snapshot(
          `Line ${lineNum}: \`${line.substring(0, 50)}\` is evaluated.`,
          lineNum,
          []
        );
      }
    }

    // If no steps were generated beyond init, run fallback
    if (this.steps.length <= 1) {
      this.simulateFallback();
    }
  }

  private simulateFallback() {
    // Simulate a default interesting example
    const lines = this.lines;
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('//')) {
        this.snapshot(`Line ${i + 1}: \`${line.substring(0, 50)}\` is evaluated.`, i + 1, []);
      }
    }
  }

  private drainMicrotasks() {
    if (this.microtaskQueue.length === 0) return;

    this.snapshot(
      'Call Stack is empty. Event Loop checks Microtask Queue first (higher priority than Task Queue).',
      -1,
      [{ type: 'event_loop_tick' }],
      true
    );

    while (this.microtaskQueue.length > 0) {
      const task = this.microtaskQueue.shift()!;
      const stackEntry = this.pushStack(task.name, -1, 'async');
      this.snapshot(
        `Microtask: \`${task.name}\` is dequeued from Microtask Queue and pushed onto the Call Stack.`,
        -1,
        [
          { type: 'microtask_dequeue', target: task.id, value: task.name },
          { type: 'stack_push', target: stackEntry.id, value: task.name },
        ],
        true
      );

      this.popStack();
      this.snapshot(
        `Microtask \`${task.name}\` completes and is popped from the Call Stack.`,
        -1,
        [{ type: 'stack_pop', value: task.name }],
        true
      );
    }
  }

  private processEventLoop() {
    if (this.taskQueue.length === 0) return;

    while (this.taskQueue.length > 0) {
      this.snapshot(
        'Microtask Queue is empty. Event Loop checks Task Queue (Macro Queue) for pending callbacks.',
        -1,
        [{ type: 'event_loop_tick' }],
        true
      );

      const task = this.taskQueue.shift()!;
      const webApi = this.webApis.find((a) => a.name === task.name);
      if (webApi) this.removeWebApi(webApi.id);

      const stackEntry = this.pushStack(task.name, -1, 'sync');
      this.snapshot(
        `Task: \`${task.name}\` is dequeued and pushed onto the Call Stack for execution.`,
        -1,
        [
          { type: 'task_dequeue', target: task.id, value: task.name },
          { type: 'stack_push', target: stackEntry.id, value: task.name },
        ],
        true
      );

      if (task.name.includes('console')) {
        this.consoleOutput.push(`> [callback output]`);
      }

      this.popStack();
      this.snapshot(
        `\`${task.name}\` completes. Call Stack is empty again.`,
        -1,
        [{ type: 'stack_pop', value: task.name }],
        false
      );

      this.drainMicrotasks();
    }
  }
}
