/* turn an array to an array of arrays of length "size" */
export function chunk(array: any[], size: number) {
  let result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
