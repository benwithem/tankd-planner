#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Default ignore directories and files (including package-lock.json)
const DEFAULT_IGNORES = ['node_modules', '.git', 'dist', 'build', 'package-lock.json', 'archive.js','archive.txt'];
const SESSION_FILE = '.archive-session.json';

/**
 * Walk upward from the current directory until a package.json is found.
 * This is used to identify the project root.
 */
function getProjectRoot() {
  let currentDir = process.cwd();
  while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break; // reached filesystem root
    currentDir = parent;
  }
  return currentDir;
}

/**
 * Reads .gitignore if it exists and returns an array of non-comment, non-empty patterns.
 */
function readGitIgnore(cwd) {
  const gitignorePath = path.join(cwd, '.gitignore');
  let patterns = [];
  if (fs.existsSync(gitignorePath)) {
    const data = fs.readFileSync(gitignorePath, 'utf8');
    patterns = data.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  }
  return patterns;
}

/**
 * Checks if a given relative file path should be ignored based on default and .gitignore patterns.
 */
function shouldIgnore(filePath, ignorePatterns) {
  const parts = filePath.split(path.sep);
  for (const pattern of DEFAULT_IGNORES) {
    if (parts.includes(pattern)) return true;
  }
  for (const pattern of ignorePatterns) {
    if (filePath.includes(pattern)) return true;
  }
  // Optionally ignore dotfiles (except .gitignore and .gitattributes).
  const base = path.basename(filePath);
  if (base.startsWith('.') && base !== '.gitignore' && base !== '.gitattributes') {
    return true;
  }
  return false;
}

/**
 * A simple heuristic to determine if a file is binary:
 * Reads the first 512 bytes and checks for null bytes.
 */
function isBinary(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(512);
    const bytesRead = fs.readSync(fd, buffer, 0, 512, 0);
    fs.closeSync(fd);
    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) {
        return true;
      }
    }
  } catch (err) {
    return true;
  }
  return false;
}

/**
 * Recursively traverses a directory (starting at dir) and returns an array of file objects:
 * { path: relative_path, content: file_content }
 */
function collectFiles(dir, cwd, ignorePatterns) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(cwd, fullPath);
    if (shouldIgnore(relPath, ignorePatterns)) continue;
    if (entry.isDirectory()) {
      files = files.concat(collectFiles(fullPath, cwd, ignorePatterns));
    } else if (entry.isFile()) {
      if (isBinary(fullPath)) continue; // skip binary files
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        files.push({ path: relPath, content });
      } catch (err) {
        console.error(`Error reading file ${relPath}: ${err.message}`);
      }
    }
  }
  return files;
}

/**
 * Estimate tokens based on the text length.
 * This heuristic assumes roughly 4 bytes per token.
 */
function estimateTokens(text) {
  return Math.ceil(Buffer.byteLength(text, 'utf8') / 4);
}

/**
 * Convert a byte count into a human-readable format.
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * Compute an MD5 hash for a given text.
 */
function computeHash(text) {
  return crypto.createHash('md5').update(text, 'utf8').digest('hex');
}

/**
 * Loads the session data from SESSION_FILE stored at the project root.
 */
function loadSession() {
  const sessionDir = getProjectRoot();
  const sessionPath = path.join(sessionDir, SESSION_FILE);
  if (fs.existsSync(sessionPath)) {
    try {
      return JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    } catch (err) {
      console.error(`Error reading session file: ${err.message}`);
      return {};
    }
  }
  return {};
}

/**
 * Saves the session data to SESSION_FILE at the project root.
 */
function saveSession(session) {
  const sessionDir = getProjectRoot();
  const sessionPath = path.join(sessionDir, SESSION_FILE);
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2), 'utf8');
}

/**
 * Analyzes and prints details for the top 5 largest files.
 */
function analyzeLargestFiles(files) {
  const fileStats = files.map(file => {
    const sizeBytes = Buffer.byteLength(file.content, 'utf8');
    return {
      path: file.path,
      sizeBytes,
      humanSize: formatBytes(sizeBytes),
      tokens: estimateTokens(file.content)
    };
  });

  fileStats.sort((a, b) => b.sizeBytes - a.sizeBytes);
  const topFiles = fileStats.slice(0, 5);
  if (topFiles.length > 0) {
    console.log(`\nTop ${topFiles.length} largest file(s):`);
    topFiles.forEach(file => {
      console.log(`- ${file.path}: ${file.humanSize} (~${file.tokens} tokens)`);
    });
  } else {
    console.log(`\nNo files to analyze for size.`);
  }
}

/**
 * Pack mode: collects files, compares against the session (unless forced),
 * writes an archive (flat text JSON file) of new/changed files,
 * and updates the session state.
 */
function pack(outputFile, force) {
  // For file collection, use the current working directory.
  const cwd = process.cwd();
  const ignorePatterns = readGitIgnore(cwd);
  console.log(`Packing files from: ${cwd}`);

  // For session tracking, always use the project root.
  const session = loadSession();
  const allFiles = collectFiles(cwd, cwd, ignorePatterns);
  let newFiles = [];
  let unchangedCount = 0;

  if (force) {
    // In force mode, include all files regardless of session state.
    newFiles = allFiles;
    for (const file of allFiles) {
      const hash = computeHash(file.content);
      session[file.path] = hash;
    }
  } else {
    for (const file of allFiles) {
      const hash = computeHash(file.content);
      if (session[file.path] && session[file.path] === hash) {
        unchangedCount++;
      } else {
        newFiles.push(file);
        session[file.path] = hash;
      }
    }
  }

  // Save updated session to the project root.
  saveSession(session);

  const archive = { files: newFiles };
  const jsonArchive = JSON.stringify(archive, null, 2);
  fs.writeFileSync(outputFile, jsonArchive, 'utf8');

  // Calculate final archive size and estimated token count.
  const sizeBytes = Buffer.byteLength(jsonArchive, 'utf8');
  const formattedSize = formatBytes(sizeBytes);
  const approxTokens = estimateTokens(jsonArchive);

  console.log(`Archive created at: ${outputFile}`);
  if (force) {
    console.log(`Forced rebuild: Packed ${newFiles.length} file(s) (all files included).`);
  } else {
    console.log(`Packed ${newFiles.length} new/changed file(s); ${unchangedCount} unchanged file(s) omitted.`);
  }
  console.log(`Archive size: ${formattedSize} (~${approxTokens} tokens).`);
  console.log(`\nToken implications:`);
  console.log(`This archive is estimated at ~${approxTokens} tokens. Most language models have token limits per request (e.g., GPT-3.5 has ~4096 tokens, while GPT-4 supports more).`);
  console.log(`If your archive exceeds these limits, consider splitting it or summarizing content.`);
  
  // Analyze and print top 5 largest files.
  analyzeLargestFiles(newFiles);
}

/**
 * Unpack mode: reads an archive and writes files to the filesystem.
 */
function unpack(archiveFile) {
  const cwd = process.cwd();
  if (!fs.existsSync(archiveFile)) {
    console.error(`Archive file "${archiveFile}" does not exist.`);
    process.exit(1);
  }
  console.log(`Unpacking archive from: ${archiveFile} into directory: ${cwd}`);
  const data = fs.readFileSync(archiveFile, 'utf8');
  let archive;
  try {
    archive = JSON.parse(data);
  } catch (err) {
    console.error(`Error parsing archive: ${err.message}`);
    process.exit(1);
  }
  if (!archive.files || !Array.isArray(archive.files)) {
    console.error('Invalid archive format.');
    process.exit(1);
  }
  for (const file of archive.files) {
    const outPath = path.join(cwd, file.path);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, file.content, 'utf8');
    console.log(`Created: ${file.path}`);
  }
  console.log(`Unpacked ${archive.files.length} file(s).`);
  console.log('Unpacking complete.');
}

/**
 * Main entry point: parse command line arguments.
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node archive.js [pack [output_file] [--force|-f]] | [unpack <archive_file>]');
    process.exit(1);
  }
  const command = args[0];
  let force = false;
  let outputFile = null;
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--force' || arg === '-f') {
      force = true;
    } else if (!outputFile) {
      outputFile = arg;
    }
  }
  if (command === 'pack') {
    pack(outputFile || 'archive.txt', force);
  } else if (command === 'unpack') {
    if (!args[1]) {
      console.error('Usage for unpack: node archive.js unpack <archive_file>');
      process.exit(1);
    }
    unpack(args[1]);
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

main();
 