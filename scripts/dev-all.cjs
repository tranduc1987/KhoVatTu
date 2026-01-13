#!/usr/bin/env node
// Cross-platform dev:all runner (no bash required)
const { spawn } = require('child_process');

const procs = [
  spawn('npm', ['run', 'dev:frontend'], { stdio: 'inherit', shell: true }),
  spawn('npm', ['--prefix', 'server', 'run', 'dev'], { stdio: 'inherit', shell: true }),
];

const handleExit = (code) => {
  if (code !== 0) {
    process.exitCode = code;
  }
};

procs.forEach((p) => p.on('exit', handleExit));
