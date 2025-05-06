export function trimDecimal(num: number, digits = 0): number {
    if (num <= 0) return num;
  
    const parts = num.toString().split(".");
    if (parts.length === 1 || digits === 0) return Math.floor(num);
  
    const decimal = parts[1].slice(0, digits);
    return parseFloat(`${parts[0]}.${decimal}`);
  }
  