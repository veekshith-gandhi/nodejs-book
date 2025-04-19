// console.log("Start");

// process.nextTick(() => {
//   console.log("Inside nextTick");
// });

// Promise.resolve().then(() => {
//   console.log("Inside Promise");
// });

// console.log("End");


const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Data fetched ✅");
  }, 2000);
});

// myPromise.then((res) => "Hello")
// .then((res) => console.log("second",res))
// .catch((err)=>console.log(err))
// .then((res) => console.log(res))
// .finally((res) => console.log("HELO"))

// Promise.all([
//   Promise.resolve("Success"),
//   Promise.reject("Fail")
// ]).then(console.log).catch(console.error)
// Output: [{status: "fulfilled", value: "Success"}, {status: "rejected", reason: "Fail"}]

// Promise.any([
//   Promise.reject("Fail"),
//   Promise.reject("Win")
// ]).then(console.log);
// Output: "Win"

Promise.resolve()
  .then(() => {
    throw new Error("Something broke");
  })
  .catch(err => {
    console.log("Caught error:", err.message);
  });
