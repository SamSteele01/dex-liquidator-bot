import { chunk } from '../src/utility';

describe('chunk', () => {
  it('should return an array of arrays', () => {
    const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const chunked = chunk(testArray, 3);
    expect(chunked.length).toEqual(4);
    expect(chunked[0]).toEqual([0, 1, 2]);
    expect(chunked[1]).toEqual([3, 4, 5]);
    expect(chunked[2]).toEqual([6, 7, 8]);
    expect(chunked[3]).toEqual([9]);
  });
});
