import fs from 'fs';
import { config } from './lib/utils.js';
import './lib/api/api.js';
import { setIntervalAsync } from 'set-interval-async';

if (!fs.existsSync('./db')) {
  fs.mkdirSync('./db');
}

console.log(`Started Fredy successfully. Ui can be accessed via http://localhost:${config.port}`);


const INTERVAL = config.interval * 60 * 1000;
import { JobRunner } from './lib/jobRunner.js';
var jobRunner = new JobRunner();
await jobRunner.initialize();

const timer = setIntervalAsync(async () => {
  await jobRunner.run();
  console.log('run')
}, INTERVAL);

