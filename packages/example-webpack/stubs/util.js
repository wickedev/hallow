// Minimal util polyfill for browser builds
// Provides only the promisify function which is used by the generator

/**
 * Simple promisify implementation for browser
 * Converts a callback-based function to return a Promise
 */
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}

module.exports = {
  promisify,
};
