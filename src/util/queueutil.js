// an awaitable queue is an object with two methods
// pop() returns a promise that resolves when the next bit of data pushed onto the queue
// unless there is already a surplus of data pushed onto the queue, in that case it returns
// immediately.
// push(data) adds the data to the queue, invoking promises waiting for data if present.
export function awaitable() {
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
