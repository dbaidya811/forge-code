import type { ChatCompletionTool } from 'openai/resources/chat/completions.mjs';
import { fsTools } from './fs-tools.js';
import { terminalTools } from './terminal-tools.js';
import { ToolExecutionResult } from '../types/tools.js';

// OpenAI specification function calling definitions
export const agentToolsDefinitions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_file',
      description: 'Create a new file or overwrite existing file with code or text content.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path of the file to create' },
          content: { type: 'string', description: 'Complete content to write' }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the text content of an existing project file.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path of the file to read' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_path',
      description: 'Delete a file or an entire directory.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to delete' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_terminal_command',
      description: 'Run commands in the terminal shell (e.g. git, npm, dir, test scripts).',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command line string to run' }
        },
        required: ['command']
      }
    }
  }
];

export async function executeToolCall(name: string, rawArgs: string): Promise<ToolExecutionResult> {
  try {
    const args = JSON.parse(rawArgs || '{}');

    switch (name) {
      case 'create_file': {
        const out = await fsTools.createFile(args.path, args.content);
        return { toolName: name, success: true, output: out };
      }
      case 'read_file': {
        const out = await fsTools.readFile(args.path);
        return { toolName: name, success: true, output: out };
      }
      case 'delete_path': {
        const out = await fsTools.deletePath(args.path);
        return { toolName: name, success: true, output: out };
      }
      case 'run_terminal_command': {
        const out = await terminalTools.runCommand(args.command);
        return { toolName: name, success: true, output: out };
      }
      default:
        return { toolName: name, success: false, output: '', error: `Unknown tool: ${name}` };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { toolName: name, success: false, output: '', error: errorMsg };
  }
}