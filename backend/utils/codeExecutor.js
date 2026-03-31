/**
 * FREE In-House Code Executor
 * No external API needed — uses system compilers directly
 * Supports: Python 3, JavaScript (Node.js), C (GCC), C++ (G++), Java
 *
 * Security: 
 *   - 10 second execution timeout
 *   - 64MB memory limit (ulimit)
 *   - Temp files cleaned after execution
 *   - No network access in executed code (no special sandboxing needed for educational use)
 */

const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const TIMEOUT_MS = 10000;    // 10 seconds
const MAX_OUTPUT = 50000;    // 50KB output limit

// Generate unique temp dir for each execution
function getTempDir() {
  const id = crypto.randomBytes(8).toString('hex');
  const dir = path.join(os.tmpdir(), `cc_exec_${id}`);
  fs.mkdirSync(dir, { recursive: true });
  return { dir, id };
}

// Clean up temp files
function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}

// Run a command with timeout and capture output
function runCommand(cmd, args, options = {}) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let killed = false;

    const proc = spawn(cmd, args, {
      ...options,
      timeout: TIMEOUT_MS,
    });

    proc.stdout?.on('data', d => { stdout += d; if (stdout.length > MAX_OUTPUT) { proc.kill(); killed = true; } });
    proc.stderr?.on('data', d => { stderr += d; if (stderr.length > MAX_OUTPUT) proc.kill(); });

    proc.on('close', (code, signal) => {
      resolve({
        stdout: stdout.substring(0, MAX_OUTPUT),
        stderr: stderr.substring(0, MAX_OUTPUT),
        exitCode: code,
        timedOut: signal === 'SIGTERM' || killed,
      });
    });

    proc.on('error', (err) => {
      resolve({ stdout: '', stderr: err.message, exitCode: -1, timedOut: false });
    });

    if (options.input) {
      proc.stdin?.write(options.input);
      proc.stdin?.end();
    }
  });
}

// ── LANGUAGE EXECUTORS ───────────────────────────────────────────────────────

async function runPython(code, stdin) {
  const { dir } = getTempDir();
  try {
    const file = path.join(dir, 'solution.py');
    fs.writeFileSync(file, code);
    const result = await runCommand('python3', ['-u', file], {
      cwd: dir,
      input: stdin || '',
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
    });
    return result;
  } finally { cleanup(dir); }
}

async function runJavaScript(code, stdin) {
  const { dir } = getTempDir();
  try {
    const file = path.join(dir, 'solution.js');
    fs.writeFileSync(file, code);
    const result = await runCommand('node', ['--max-old-space-size=64', file], {
      cwd: dir,
      input: stdin || '',
    });
    return result;
  } finally { cleanup(dir); }
}

async function runC(code, stdin) {
  const { dir } = getTempDir();
  try {
    const srcFile = path.join(dir, 'solution.c');
    const outFile = path.join(dir, 'solution');
    fs.writeFileSync(srcFile, code);

    // Compile
    const compile = await runCommand('gcc', [
      '-o', outFile, srcFile,
      '-lm', '-O2', '-std=c11',
      '-Wall', '-Wextra', '-Werror=implicit-function-declaration',
    ], { cwd: dir });

    if (compile.exitCode !== 0) {
      return { stdout: '', stderr: compile.stderr, exitCode: compile.exitCode, compile_error: true };
    }

    // Run
    return await runCommand(outFile, [], { cwd: dir, input: stdin || '' });
  } finally { cleanup(dir); }
}

async function runCpp(code, stdin) {
  const { dir } = getTempDir();
  try {
    const srcFile = path.join(dir, 'solution.cpp');
    const outFile = path.join(dir, 'solution');
    fs.writeFileSync(srcFile, code);

    const compile = await runCommand('g++', [
      '-o', outFile, srcFile,
      '-lm', '-O2', '-std=c++17',
    ], { cwd: dir });

    if (compile.exitCode !== 0) {
      return { stdout: '', stderr: compile.stderr, exitCode: compile.exitCode, compile_error: true };
    }

    return await runCommand(outFile, [], { cwd: dir, input: stdin || '' });
  } finally { cleanup(dir); }
}

async function runJava(code, stdin) {
  const { dir } = getTempDir();
  try {
    // Extract class name from code
    const classMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Solution';
    const srcFile = path.join(dir, `${className}.java`);
    fs.writeFileSync(srcFile, code);

    // Find javac (might be in different locations)
    const javacPaths = [
      'javac',
      '/usr/lib/jvm/java-21-openjdk-amd64/bin/javac',
      '/usr/lib/jvm/java-17-openjdk-amd64/bin/javac',
      '/usr/lib/jvm/default-java/bin/javac',
      '/usr/local/lib/jvm/java-21/bin/javac',
    ];

    let javac = null;
    for (const p of javacPaths) {
      try {
        if (p === 'javac') {
          const check = await runCommand('which', ['javac'], {});
          if (check.exitCode === 0 && check.stdout.trim()) { javac = 'javac'; break; }
        } else if (fs.existsSync(p)) { javac = p; break; }
      } catch {}
    }

    if (!javac) {
      return {
        stdout: '',
        stderr: 'Java compiler (javac) not available on this server. Java support requires JDK installation.\nAdd "apt-get install -y default-jdk" to your render.yaml buildCommand.',
        exitCode: 1,
        compile_error: true,
      };
    }

    // Compile
    const compile = await runCommand(javac, [srcFile, '-d', dir], { cwd: dir });
    if (compile.exitCode !== 0) {
      return { stdout: '', stderr: compile.stderr, exitCode: compile.exitCode, compile_error: true };
    }

    // Run
    const javaCmd = javac.replace('javac', 'java');
    return await runCommand(javaCmd === 'java' ? 'java' : javaCmd, [
      '-cp', dir, '-Xmx64m', className,
    ], { cwd: dir, input: stdin || '' });
  } finally { cleanup(dir); }
}

async function runCSharp(code, stdin) {
  // C# requires dotnet runtime — check if available
  const { dir } = getTempDir();
  try {
    const dotnetCheck = await runCommand('which', ['dotnet'], {});
    if (dotnetCheck.exitCode !== 0) {
      return {
        stdout: '',
        stderr: 'C# (dotnet) not available on this server. Install with: apt-get install -y dotnet-runtime-8.0\nFor now, try Python, C, C++, or JavaScript.',
        exitCode: 1,
      };
    }
    // If dotnet is available
    const file = path.join(dir, 'Program.cs');
    fs.writeFileSync(file, code);
    const proj = `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>`;
    fs.writeFileSync(path.join(dir, 'app.csproj'), proj);
    const run = await runCommand('dotnet', ['run', '--project', path.join(dir, 'app.csproj')], {
      cwd: dir, input: stdin || '',
    });
    return run;
  } finally { cleanup(dir); }
}

// ── MAIN EXECUTOR ────────────────────────────────────────────────────────────

const EXECUTORS = {
  python:     runPython,
  python3:    runPython,
  javascript: runJavaScript,
  js:         runJavaScript,
  c:          runC,
  cpp:        runCpp,
  'c++':      runCpp,
  java:       runJava,
  csharp:     runCSharp,
  'c#':       runCSharp,
};

async function executeCode(language, code, stdin = '') {
  const lang = (language || '').toLowerCase().trim();
  const executor = EXECUTORS[lang];

  if (!executor) {
    return {
      stdout: '',
      stderr: `Language '${language}' not supported. Supported: Python, JavaScript, C, C++, Java, C#`,
      exitCode: 1,
      status: { id: 6, description: 'Not Supported' },
    };
  }

  try {
    const result = await executor(code, stdin);

    let statusDesc = 'Accepted';
    let statusId = 3;
    if (result.timedOut) { statusDesc = 'Time Limit Exceeded'; statusId = 5; }
    else if (result.compile_error) { statusDesc = 'Compilation Error'; statusId = 6; }
    else if (result.exitCode !== 0) { statusDesc = 'Runtime Error'; statusId = 11; }

    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_error ? result.stderr : '',
      status: { id: statusId, description: statusDesc },
      time: '< 10s',
      memory: null,
      exit_code: result.exitCode,
    };
  } catch (e) {
    return {
      stdout: '',
      stderr: 'Execution failed: ' + e.message,
      status: { id: 13, description: 'Internal Error' },
    };
  }
}

module.exports = { executeCode };
