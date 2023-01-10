//generate random number
export const random = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min

//create array from range
export const range = (start, end, step = 1) => {
  let output = []
  if (typeof end === 'undefined') {
    end = start
    start = 0
  }
  for (let i = start; i < end; i += step) {
    output.push(i)
  }
  return output
}

/**
 * pick random element from array
 * @param {Array} arr
 * @returns random item from array
 */
export const sampleOne = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

//check number of times an element apears in an array
export const elementCount = (arr, elem) => {
  let count = 0

  arr.forEach((element) => {
    if (element === elem) {
      count++
    }
  })

  return count
}

//randomize index of elements in an array
/**
 *
 * @param {Array} array of numbers to randomize
 * @param {Number} number of times each element will appear in the random array. Defaults to 1.
 * @returns Array of randomized numbers
 */
export const randomizeArray = (arr, times = 1) => {
  const output = []

  while (output.length < arr.length * times) {
    const sample = sampleOne(arr)

    const sampleInArray = elementCount(output, sample)

    if (sampleInArray < times) {
      output.push(sample)
    }
  }

  return output
}
