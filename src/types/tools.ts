export interface ToolCallPayload {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  output: string;
  error?: string;
}