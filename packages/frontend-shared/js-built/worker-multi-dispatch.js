function defaultUseWorkerNumber(prev) {
  return prev + 1;
}
class WorkerMultiDispatch {
  symbol = Symbol("WorkerMultiDispatch");
  workers = [];
  terminated = false;
  prevWorkerNumber = 0;
  getUseWorkerNumber;
  finalizationRegistry;
  constructor(workerConstructor, concurrency, getUseWorkerNumber = defaultUseWorkerNumber) {
    this.getUseWorkerNumber = getUseWorkerNumber;
    for (let i = 0; i < concurrency; i++) {
      this.workers.push(workerConstructor());
    }
    this.finalizationRegistry = new FinalizationRegistry(() => {
      this.terminate();
    });
    this.finalizationRegistry.register(this, this.symbol);
    if (_DEV_) console.log("WorkerMultiDispatch: Created", this);
  }
  postMessage(message, options, useWorkerNumber = this.getUseWorkerNumber) {
    let workerNumber = useWorkerNumber(this.prevWorkerNumber, this.workers.length);
    workerNumber = Math.abs(Math.round(workerNumber)) % this.workers.length;
    if (_DEV_) console.log("WorkerMultiDispatch: Posting message to worker", workerNumber, useWorkerNumber);
    this.prevWorkerNumber = workerNumber;
    if (Array.isArray(options)) {
      this.workers[workerNumber].postMessage(message, options);
    } else {
      this.workers[workerNumber].postMessage(message, options);
    }
    return workerNumber;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addListener(callback, options) {
    this.workers.forEach((worker) => {
      worker.addEventListener("message", callback, options);
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeListener(callback, options) {
    this.workers.forEach((worker) => {
      worker.removeEventListener("message", callback, options);
    });
  }
  terminate() {
    this.terminated = true;
    if (_DEV_) console.log("WorkerMultiDispatch: Terminating", this);
    this.workers.forEach((worker) => {
      worker.terminate();
    });
    this.workers = [];
    this.finalizationRegistry.unregister(this);
  }
  isTerminated() {
    return this.terminated;
  }
  getWorkers() {
    return this.workers;
  }
  getSymbol() {
    return this.symbol;
  }
}
export {
  WorkerMultiDispatch
};
//# sourceMappingURL=worker-multi-dispatch.js.map
