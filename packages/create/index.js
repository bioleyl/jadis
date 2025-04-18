#!/usr/bin/env node

const [template, projectName] = process.argv.slice(2);

if (template !== 'js' && template !== 'ts') {
  console.error('Please specify a valid template: "js" or "ts".');
  process.exit(1);
}

if (!projectName) {
  console.error('Please specify a project name.');
  process.exit(1);
}

const fs = require('fs');
const cwd = process.cwd();
const path = require('path');

const templatePath = path.join(__dirname, 'templates', template);
const projectPath = path.join(cwd, projectName);

const createProject = (templatePath, projectPath) => {
  // Create project directory
  fs.mkdirSync(projectPath, { recursive: true });

  const templateFiles = fs.readdirSync(templatePath);

  // Copy template files to project directory
  templateFiles.forEach((file) => {
    const srcFile = path.join(templatePath, file);
    const destFile = path.join(projectPath, file);

    if (fs.lstatSync(srcFile).isDirectory()) {
      createProject(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
};

createProject(templatePath, projectPath);

console.log('\nCreating a new project...\n');

console.log(
  `✅ Project "${projectName}" created successfully with the "${template}" template.\n`
);

console.log('Next steps:\n');
console.log(`  1. cd ${projectName}`);
console.log('  2. npm install     # install dependencies');
console.log('  3. npm run dev     # start the project\n');
