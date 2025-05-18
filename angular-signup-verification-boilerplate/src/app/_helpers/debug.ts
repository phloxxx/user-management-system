export class Debug {
  // A simple utility to add verbose debugging
  static log(context: string, message: any): void {
    console.log(`[${context}]`, message);
  }
  
  static error(context: string, message: any): void {
    console.error(`[${context}]`, message);
  }
  
  static warn(context: string, message: any): void {
    console.warn(`[${context}]`, message);
  }
}
