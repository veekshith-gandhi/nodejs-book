console.log("Start");

process.nextTick(() => {
  console.log("Inside nextTick");
});

Promise.resolve().then(() => {
  console.log("Inside Promise");
});

console.log("End");
