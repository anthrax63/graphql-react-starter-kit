require('./serverWorker');

/* const cluster = require('cluster');
const os = require('os');
const cpuCount = os.cpus().length;
const workerCount = process.env.WORKER_COUNT || (process.env.NODE_ENV === 'development' ? 1 : cpuCount);

if (cluster.isMaster) {
  for(let i = 0; i < workerCount; i++) {
    cluster.fork();
  }
} else {
  require('./serverWorker');
}*/
