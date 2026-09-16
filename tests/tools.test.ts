import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs/promises';
import { executeToolCall } from '../src/tools/index.js';

const TEST_DIR = path.resolve(process.cwd(), 'temp_test_sandbox');
const TEST_FILE = path.join('temp_test_sandbox', 'sample.txt');

test.beforeEach(async () => {
  // Ensure a clean sandbox directory before each test
  await fs.mkdir(TEST_DIR, { recursive: true });
});

test.afterEach(async () => {
  // Clean up sandbox artifacts after test completion
  try {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors if directory does not exist
  }
});

test('Tools: create_file writes text to filesystem', async () => {
  const fileContent = 'console.log("Hello from Forge!");';
  const result = await executeToolCall(
    'create_file',
    JSON.stringify({ path: TEST_FILE, content: fileContent })
  );

  assert.equal(result.success, true);
  assert.ok(result.output.includes('File created successfully'));

  const writtenData = await fs.readFile(path.resolve(process.cwd(), TEST_FILE), 'utf-8');
  assert.equal(writtenData, fileContent);
});

test('Tools: read_file fetches accurate file contents', async () => {
  const content = 'Test line payload';
  await fs.writeFile(path.resolve(process.cwd(), TEST_FILE), content, 'utf-8');

  const result = await executeToolCall(
    'read_file',
    JSON.stringify({ path: TEST_FILE })
  );

  assert.equal(result.success, true);
  assert.equal(result.output, content);
});

test('Tools: delete_path removes targeted file', async () => {
  const fullPath = path.resolve(process.cwd(), TEST_FILE);
  await fs.writeFile(fullPath, 'temp data', 'utf-8');

  const result = await executeToolCall(
    'delete_path',
    JSON.stringify({ path: TEST_FILE })
  );

  assert.equal(result.success, true);
  assert.ok(result.output.includes('File deleted'));

  // Confirm file does not exist
  await assert.rejects(async () => {
    await fs.stat(fullPath);
  });
});

test('Tools: run_terminal_command executes shell commands', async () => {
  // Use a cross-platform basic echo command
  const result = await executeToolCall(
    'run_terminal_command',
    JSON.stringify({ command: 'node -e "console.log(\'runner-ok\')"' })
  );

  assert.equal(result.success, true);
  assert.ok(result.output.includes('runner-ok'));
});

test('Tools: invalid tool name returns graceful failure', async () => {
  const result = await executeToolCall('unsupported_action', '{}');

  assert.equal(result.success, false);
  assert.ok(result.error?.includes('Unknown tool'));
});