#!/usr/bin/env node
/**
 * Year 10 Higher Cycle 1 revision board. One fluency question per topic, three versions.
 */
const { buildHigher } = require('./y10-cycle-1-topics');
const { writeBoard } = require('./assemble-board');

const items = buildHigher();
if (items.length !== 46) throw new Error('expected 46 items, got ' + items.length);

writeBoard({
  year: 10,
  cycle: 1,
  items,
  tag: 'Y10 H',
  fileBase: 'y10higher-cycle-1-revision',
  title: 'Year 10 Higher Cycle 1'
});
