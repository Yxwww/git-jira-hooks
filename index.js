#!/usr/bin/env node

const { exec: childProcessExec } = require('child_process');
const { promisify } = require('util');
const { readFile: fsReadFile, writeFile: fsWritefile } = require('fs');
const { exit } = require('process');

const exec = promisify(childProcessExec);
const readFile = promisify(fsReadFile);
const writeFile = promisify(fsWritefile);

function complete() {
  exit(0);
}

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

async function getCurrentIssueNumberFromBranchName(issueRegex) {
  return (await getCurrentBranch()).match(issueRegex);
}

async function fillCommitMessageWithJiraIssueId(issueRegex){
  const [,,commitMessagePath] = process.argv;
  const issueNumberMatchedStrs = await getCurrentIssueNumberFromBranchName(issueRegex);
  if (!issueNumberMatchedStrs) {
    complete();
    return;
  }
  const [ issueNumber ] = issueNumberMatchedStrs;
  const message = (await readFile(commitMessagePath, 'utf8')).trim();
  await writeFile(commitMessagePath, `${issueNumber}\n${message}`, 'utf8')
}

fillCommitMessageWithJiraIssueId(/(CLD-[^/]*)/g);
