const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'backend', 'data', 'guides.json');
const fromId = 'section_1768335118791';
const beforeId = 'section_1759884000254';

try {
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.length === 0) throw new Error('Unexpected JSON structure');
  const sections = data[0].sections;
  const fromIndex = sections.findIndex(s => s.id === fromId);
  const beforeIndex = sections.findIndex(s => s.id === beforeId);
  if (fromIndex === -1) throw new Error(`Section to move not found: ${fromId}`);
  if (beforeIndex === -1) throw new Error(`Target section not found: ${beforeId}`);
  const [section] = sections.splice(fromIndex, 1);
  const insertIndex = sections.findIndex(s => s.id === beforeId);
  sections.splice(insertIndex, 0, section);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Moved section ${fromId} before ${beforeId}`);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
