import fs from 'fs/promises';
import path from 'path';

export const fsTools = {
  async createFile(filePath: string, content: string): Promise<string> {
    const resolved = path.resolve(process.cwd(), filePath);
    await fs.mkdir(path.dirname(resolved), { recursive: true });
    await fs.writeFile(resolved, content, 'utf-8');
    return `File created successfully at ${filePath}`;
  },

  async readFile(filePath: string): Promise<string> {
    const resolved = path.resolve(process.cwd(), filePath);
    return await fs.readFile(resolved, 'utf-8');
  },

  async deletePath(targetPath: string): Promise<string> {
    const resolved = path.resolve(process.cwd(), targetPath);
    const stat = await fs.stat(resolved);
    if (stat.isDirectory()) {
      await fs.rm(resolved, { recursive: true, force: true });
      return `Directory deleted: ${targetPath}`;
    } else {
      await fs.unlink(resolved);
      return `File deleted: ${targetPath}`;
    }
  },

  async createDirectory(dirPath: string): Promise<string> {
    const resolved = path.resolve(process.cwd(), dirPath);
    await fs.mkdir(resolved, { recursive: true });
    return `Directory created at ${dirPath}`;
  }
};