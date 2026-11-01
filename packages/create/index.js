#!/usr/bin/env node

const fs = require('node:fs');
const cwd = process.cwd();
const path = require('node:path');

const VANILLA_TEMPLATE = 'vanilla';
const supportedTemplates = ['js', 'ts', 'ssr', VANILLA_TEMPLATE];
const [template, projectName] = process.argv.slice(2);

if (!supportedTemplates.includes(template)) {
  console.error(`Please specify a valid template: ${supportedTemplates.map((item) => `"${item}"`).join(', ')}.`);
  process.exit(1);
}

if (!projectName) {
  console.error('Please specify a project name.');
  process.exit(1);
}

const templatePath = path.join(__dirname, 'templates', template);
const projectPath = path.join(cwd, projectName);

// The vanilla template loads @jadis/core from a CDN. Its import map holds a placeholder for the version, which the
// template's package.json keeps in step with the core release (see scripts/set-version.mjs). That manifest only
// carries the version, so the project does not get it.
const TEMPLATE_MANIFEST = 'package.json';
const VANILLA_ENTRY = 'index.html';
const CDN_VERSION_PLACEHOLDER = '__JADIS_VERSION__';

// npm never publishes a file named .gitignore: the templates hold theirs under another name, which the project gets
// back as .gitignore.
const PROJECT_FILE_NAMES = new Map([['_gitignore', '.gitignore']]);

const createProject = (templatePath, projectPath, excludedFiles = []) => {
  // Create project directory
  fs.mkdirSync(projectPath, { recursive: true });

  const templateFiles = fs.readdirSync(templatePath).filter((file) => !excludedFiles.includes(file));

  // Copy template files to project directory
  templateFiles.forEach((file) => {
    const srcFile = path.join(templatePath, file);
    const destFile = path.join(projectPath, PROJECT_FILE_NAMES.get(file) ?? file);

    if (fs.lstatSync(srcFile).isDirectory()) {
      createProject(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
};

const readCdnVersion = () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(templatePath, TEMPLATE_MANIFEST), 'utf8'));
  return manifest.jadis?.cdnVersion;
};

const fillCdnVersion = (cdnVersion) => {
  const entryPath = path.join(projectPath, VANILLA_ENTRY);
  const entry = fs.readFileSync(entryPath, 'utf8');
  fs.writeFileSync(entryPath, entry.replaceAll(CDN_VERSION_PLACEHOLDER, cdnVersion));
};

const createVanillaProject = () => {
  const cdnVersion = readCdnVersion();
  if (!cdnVersion) {
    console.error('The vanilla template has no @jadis/core version for its import map.');
    process.exit(1);
  }

  createProject(templatePath, projectPath, [TEMPLATE_MANIFEST]);
  fillCdnVersion(cdnVersion);
};

if (template === VANILLA_TEMPLATE) {
  createVanillaProject();
} else {
  createProject(templatePath, projectPath);
}

console.log('\nCreating a new project...\n');

console.log(`✅ Project "${projectName}" created successfully with the "${template}" template.\n`);

console.log('Next steps:\n');
console.log(`  1. cd ${projectName}`);

if (template === VANILLA_TEMPLATE) {
  console.log('  2. npx serve .     # start a static HTTP server\n');
} else {
  console.log('  2. npm install     # install dependencies');
  console.log('  3. npm run dev     # start the project\n');
}
