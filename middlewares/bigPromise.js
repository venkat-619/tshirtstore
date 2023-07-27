// try catch and async - await || use promise

// functional programming
// higher order functions : - A function that accepts and/or returns another function is called a higher-order function.
// ex : - add = (x) => (y) => x + y;
// https://www.freecodecamp.org/news/a-quick-intro-to-higher-order-functions-in-javascript-1a014f89c6b/

module.exports = func => (req, res, next) =>  {
    Promise.resolve(func(req, res, next)).catch(next);
}