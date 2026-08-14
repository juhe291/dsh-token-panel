/** CSS Modules ambient declaration for the client build. */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}
