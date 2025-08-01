// This script injects environment variables into the HTML at build time
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all environment variables that start with NEXT_PUBLIC_
const envVars = Object.entries(process.env)
  .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
  .reduce((acc, [key, value]) => ({
    ...acc,
    [key]: value
  }), {});

// Path to the index.html file
const indexPath = path.resolve(__dirname, '../dist/index.html');

// Read the index.html file
fs.readFile(indexPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading index.html:', err);
    process.exit(1);
  }

  // Create a script tag with the environment variables
  const envScript = `
    <script>
      // Injected environment variables
      window.__ENV = ${JSON.stringify(envVars)};
    </script>
  `;

  // Insert the script tag before the closing head tag
  const result = data.replace('</head>', `${envScript}</head>`);

  // Write the updated HTML back to the file
  fs.writeFile(indexPath, result, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to index.html:', err);
      process.exit(1);
    }
    console.log('Successfully injected environment variables into index.html');
  });
});
