import { delay } from '../../src/utility';

const batches = [1, 2, 3, 4, 5, 6];

async function logAndSleep() {
  for (const batch of batches) {
    console.log(batch);
    await delay(1000);
  }
}

logAndSleep();
// expect the numbers 1 - 6 to log one at a time, one second apart.
