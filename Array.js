// Transforms each element in the array and returns a new array of the same length.

const numbers = [1, 2, 3, 4];
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6]

//Filters the array based on a condition and returns a new array with only the matching elements.

const even = numbers.filter(num => num % 2 === 0);
console.log(even); // [2, 4]


//Reduces the array to a single value (like a sum, object, string, etc.).

const total = numbers.reduce((acc, num) => acc + num, 0);
console.log(total); // 10


//count occurence

const str = "Veekshith";
const occurence = str.split("").reduce((acc,cur)=>{
    acc[cur] = (acc[cur] || 0) + 1;
    return acc;
},{})
console.log(occurence)

//Because forEach() always returns undefined, regardless of what your callback does.
//forEach() is not aware of Promises.
//So all the async callbacks are triggered in parallel.
//And forEach() completes immediately, without awaiting any of them.
// ❌ This won't work as expected

arr.forEach(async (item) => {
    await someAsyncFn(item); // Won’t wait
});
  
// ✅ Correct approach
for (const item of arr) {
await someAsyncFn(item); // Will wait
}

