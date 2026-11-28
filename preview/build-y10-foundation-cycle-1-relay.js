#!/usr/bin/env node
/**
 * Year 10 Foundation Cycle 1 revision board. One fluency question per topic, three versions.
 */
const { buildFoundation } = require('./y10-cycle-1-topics');
const { writeBoard } = require('./assemble-board');

const items = buildFoundation();
if (items.length !== 44) throw new Error('expected 44 items, got ' + items.length);

writeBoard({
  year: 10,
  cycle: 1,
  items,
  tag: 'Y10 F',
  fileBase: 'y10foundation-cycle-1-revision',
  title: 'Year 10 Foundation Cycle 1'
});
