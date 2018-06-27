// an awaitable queue is an object with two methods
// pop() returns a promise that resolves when the next bit of data pushed onto the queue
// unless there is already a surplus of data pushed onto the queue, in that case it returns
// immediately.
// push(data) adds the data to the queue, invoking promises waiting for data if present.
export function awaitableQueue() {
  let queue = [],
    resolvers = [];
  return {
    pop() {
      if (queue.length > 0) return Promise.resolve(queue.shift());
      return new Promise((resolve, reject) => resolvers.push(resolve));
    },
    push(payload) {
      if (resolvers.length > 0) resolvers.shift()(payload);
      else queue.push(payload);
    }
  };
}

export function flow(controller, catcher) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      let ctx = {
        fail(reason) {
          if (ctx.failed) return;
          ctx.failed = reason || true;
          try {
            if (catcher) catcher.call(ctx);
          } finally {
            reject(reason);
          }
        },
        check(value) {
          if (ctx.failed) throw new Error(ctx.failed);
          return value;
        }
      };
      controller
        .apply(ctx, args)
        .then(result => resolve(result))
        .catch(error => ctx.fail(error));
    });
  };
}
