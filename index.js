#!/usr/bin/env node

const { exec: childProcessExec } = require('child_process');
const { promisify } = require('util');
const { readFile: fsReadFile } = require('fs');
const exec = promisify(childProcessExec);
const readFile = promisify(fsReadFile)

const issueRegex = /(CLD-[^/]*)/g;

async function execStdout(cmd) {
  const { stderr, stdout } = await exec(cmd);
  if(stderr){
    throw new Error(stderr);
  }
  return stdout.trim();
}

async function getCurrentBranch() {
  return await execStdout('git symbolic-ref --short HEAD');
}

async function getCurrentIssueNumberFromBranchName() {
  const currentBranch = await getCurrentBranch();
  return currentBranch.match(issueRegex);
}

async function checkCommitMessage(){
  const message = (await readFile(process.argv[2], 'utf8')).trim();
  const [ currentIssueNumber ] = await getCurrentIssueNumberFromBranchName();
  console.log('currentIssue: ', currentIssueNumber);
}

checkCommitMessage();

