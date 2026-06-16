import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';

const isDev = process.env.NODE_ENV !== 'production';
let mainWindow: BrowserWindow | null = null;

// Ensure directories
const userDataPath = app.getPath('userData');
const MODELS_DIR = path.join(userDataPath, 'models');
const DB_PATH = path.join(userDataPath, 'promptbuddy.db');

if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

// Database Setup
const db = new Database(DB_PATH);

// Database Setup
db.exec(`
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    system_prompt TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(chat_id) REFERENCES chats(id)
  );
`);

// Perform a migration if system_prompt column does not exist
try {
  const tableInfo = db.prepare('PRAGMA table_info(chats)').all() as any[];
  if (!tableInfo.some(col => col.name === 'system_prompt')) {
    db.exec('ALTER TABLE chats ADD COLUMN system_prompt TEXT');
  }
} catch (e) {
  console.error("Migration failed", e);
}

// Llama Model
const MODEL_FILENAME = 'qwen2.5-1.5b-instruct-q4_k_m.gguf';
const MODEL_PATH = path.join(MODELS_DIR, MODEL_FILENAME);
const MODEL_URL = 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf';

let llamaModel: any = null;
let llamaContext: any = null;

async function initLlama() {
  if (llamaModel) return;
  if (!fs.existsSync(MODEL_PATH)) return;
  try {
    const { getLlama } = await import('node-llama-cpp');
    const llama = await getLlama();
    llamaModel = await llama.loadModel({ modelPath: MODEL_PATH });
    llamaContext = await llamaModel.createContext();
    console.log('Llama model loaded successfully.');
  } catch (err) {
    console.error('Failed to init node-llama-cpp', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  createWindow();
  await initLlama();
});

// IPC: Setup Status
ipcMain.handle('setup:status', () => {
  return fs.existsSync(MODEL_PATH);
});

// IPC: Download Model
ipcMain.handle('setup:download', async (event) => {
  if (fs.existsSync(MODEL_PATH)) return { success: true };

  const file = fs.createWriteStream(MODEL_PATH);

  https.get(MODEL_URL, (response) => {
    if (response.statusCode === 302 && response.headers.location) {
      https.get(response.headers.location, (redirectRes) => {
        const total = parseInt(redirectRes.headers['content-length'] || '0', 10);
        let downloaded = 0;

        redirectRes.on('data', (chunk) => {
          downloaded += chunk.length;
          const progress = total ? (downloaded / total) * 100 : 0;
          event.sender.send('setup:progress', { progress: progress.toFixed(2), downloaded, total });
        });

        redirectRes.pipe(file);

        file.on('finish', async () => {
          file.close();
          await initLlama();
          event.sender.send('setup:done');
        });
      }).on('error', (err) => {
        fs.unlink(MODEL_PATH, () => {});
        event.sender.send('setup:error', err.message);
      });
    } else {
      event.sender.send('setup:error', 'Failed to download model');
    }
  }).on('error', (err) => {
    fs.unlink(MODEL_PATH, () => {});
    event.sender.send('setup:error', err.message);
  });
});

// IPC: Database operations
ipcMain.handle('db:getChats', () => {
  return db.prepare('SELECT * FROM chats ORDER BY updated_at DESC').all();
});

ipcMain.handle('db:createChat', (event, title, systemPrompt) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO chats (id, title, system_prompt, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, title || 'New Chat', systemPrompt || null, now, now);
  return { id, title, system_prompt: systemPrompt };
});

ipcMain.handle('db:deleteChat', (event, id) => {
  db.prepare('DELETE FROM messages WHERE chat_id = ?').run(id);
  db.prepare('DELETE FROM chats WHERE id = ?').run(id);
  return { success: true };
});

ipcMain.handle('db:updateChatTitle', (event, id, title) => {
  db.prepare('UPDATE chats SET title = ?, updated_at = ? WHERE id = ?').run(title, new Date().toISOString(), id);
  return { success: true };
});

ipcMain.handle('db:getMessages', (event, id) => {
  return db.prepare('SELECT role, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC').all();
});

// IPC: Chat Completions
ipcMain.handle('chat:completion', async (event, messages, chatId) => {
  if (!llamaModel) throw new Error('Model not loaded');

  const userMessage = messages[messages.length - 1];
  
  if (chatId) {
    db.prepare('INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), chatId, userMessage.role, userMessage.content, new Date().toISOString());
    db.prepare('UPDATE chats SET updated_at = ? WHERE id = ?').run(new Date().toISOString(), chatId);
  }

  try {
    const { LlamaChatSession } = await import('node-llama-cpp');
    
    // Fetch system prompt if chatId is present
    let customSystemPrompt = "You are a highly capable AI Student Assistant. You help with Coding, Debugging, DSA, Web Dev, AI/ML, Projects, and Interviews.";
    if (chatId) {
      const chatRow = db.prepare('SELECT system_prompt FROM chats WHERE id = ?').get(chatId) as any;
      if (chatRow && chatRow.system_prompt) {
        customSystemPrompt = chatRow.system_prompt;
      }
    }

    const session = new LlamaChatSession({
      contextSequence: llamaContext.getSequence(),
      systemPrompt: customSystemPrompt
    });

    const chatHistory = messages.slice(0, -1).map((m: any) => ({
      type: m.role === 'user' ? 'user' : 'model',
      text: m.content
    }));
    session.setChatHistory(chatHistory);

    let fullResponse = '';
    
    await session.prompt(userMessage.content, {
      onTextChunk(chunk) {
        fullResponse += chunk;
        event.sender.send('chat:stream', chunk);
      }
    });

    if (chatId) {
      db.prepare('INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), chatId, 'assistant', fullResponse, new Date().toISOString());
    }

    event.sender.send('chat:done');
  } catch (err: any) {
    console.error(err);
    event.sender.send('chat:stream', '\n\n**Error:** ' + err.message);
    event.sender.send('chat:done');
  }
});

// IPC: File Parsing
ipcMain.handle('file:select', async () => {
  if (!mainWindow) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['pdf', 'docx', 'txt', 'md', 'csv', 'json', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled || filePaths.length === 0) return null;
  
  return {
    path: filePaths[0],
    name: path.basename(filePaths[0]),
    ext: path.extname(filePaths[0]).toLowerCase()
  };
});

ipcMain.handle('file:parse', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) throw new Error('File not found');
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (ext === '.docx') {
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      // Default fallback for text/code files
      const text = fs.readFileSync(filePath, 'utf8');
      return text;
    }
  } catch (e: any) {
    console.error('File parse error:', e);
    throw new Error('Failed to parse file: ' + e.message);
  }
});
