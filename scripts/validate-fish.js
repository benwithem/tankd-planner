import { readFileSync } from 'fs';
import { globbySync } from 'globby';
import yaml from 'js-yaml';
import chalk from 'chalk';
import { diffLines } from 'diff';

// Import your configuration
// Update this import
import { fishSchema } from '../src/config/fish-schema.js';

const FISH_DIR = 'src/content/fish/*.md';

function validateFrontmatter(content) {
  const errors = [];
  const frontmatter = content.split('---')[1];
  const data = yaml.load(frontmatter);

  // Validate against schema from config.ts
  for (const [field, validator] of Object.entries(fishSchema)) {
    const result = validator(data[field]);
    if (!result.valid) {
      errors.push({
        field,
        message: result.message,
        current: data[field],
        expected: result.expected
      });
    }
  }

  return errors;
}

function generateDiffReport(original, modified) {
  return diffLines(original, modified)
    .map(part => {
      const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      return chalk[color](part.value);
    })
    .join('');
}

function validateFishFiles() {
  const files = globbySync(FISH_DIR);
  
  files.forEach(file => {
    const content = readFileSync(file, 'utf8');
    const errors = validateFrontmatter(content);
    
    if (errors.length === 0) {
      console.log(chalk.green(`\n✅ ${file} is valid`));
      return;
    }

    console.log(chalk.yellow(`\n🔧 Problems in ${file}:`));
    errors.forEach(({ field, message, current, expected }) => {
      console.log(chalk.red(`  [${field}] ${message}`));
      console.log(`  Current: ${chalk.yellow(current)}`);
      console.log(`  Expected: ${chalk.cyan(expected)}\n`);
    });

    // Generate diff report
    const originalFrontmatter = content.split('---')[1];
    const proposedFix = errors.reduce((acc, error) => {
      return acc.replace(
        new RegExp(`${error.field}:.*`), 
        `${error.field}: ${error.expected}`
      );
    }, originalFrontmatter);
    
    console.log(generateDiffReport(originalFrontmatter, proposedFix));
  });
}

validateFishFiles();