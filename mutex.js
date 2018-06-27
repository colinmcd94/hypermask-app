// a mutex is an object which has two methods
// free() a function which returns a promise that resolves when all the locks are freed
// lock() a function that returns a function unlock() which you can call to mark the mutex as resolved
// you can set up concurrent locks (i.e. run these two tasks simultaneously, but only free when both are freed).
// as a convenience method, the mutex object is itself an async function that takes an async function
// which waits until it is free, allocates a lock, and then resolves the lock, when the function is finished

export function create() {
  let mutex_promise = Promise.resolve(true);
  async function mutex(fn) {
    await mutex.free();
    let unlock = mutex.lock();
    try {
      return await fn();
    } finally {
      unlock();
    }
  }
  mutex.free = () => mutex_promise;
  mutex.lock = () => {
    let unlock,
      next = new Promise((resolve, reject) => (unlock = resolve));
    mutex_promise = mutex_promise.then(() => next);
    return () => {
      setTimeout(() => unlock(true), 0);
    };
  };
  return mutex;
}

let closingMutex = create();
export default closingMutex;
