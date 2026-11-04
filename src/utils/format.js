/** Persen dengan koma desimal, misalnya "27,5%". */
export const persen = (n, total) =>
  `${(total > 0 ? (n / total) * 100 : 0).toFixed(1).replace(".", ",")}%`;
