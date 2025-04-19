console.log("Start");

process.nextTick(() => {
  console.log("Inside nextTick");
});

Promise.resolve().then(() => {
  console.log("Inside Promise");
});

console.log("End");


const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Data fetched ✅");
  }, 2000);
});

myPromise.then((res) => "Hello")
.then((res) => console.log("second",res))
.catch((err)=>console.log(err))