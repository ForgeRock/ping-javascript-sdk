// Skip Husky install in production and CI
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  process.exit(0);
}
<<<<<<< HEAD
const husky = (await import('husky')).default;
husky();
=======
const husky = (await import('husky')).default
console.log(husky())
>>>>>>> aeefdd88 (chore: fix-logic-add-tests)
