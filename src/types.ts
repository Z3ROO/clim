
export interface ICommand {
  name: string
  title?: string
  action: (options:any) => void
  description: string
  help?: string
  flags: Option[]
  subCommands?: ICommand[]
}

export interface Option {
  command?: string
  alias?: string
  type: 'stdin'|'string'|'boolean'
  description?: string
  help?: string
}

export interface Params {
  [key: string]: string|boolean
};

export interface LogFunction {
  (text:string): void
  info: (text:string) => void
  err: (text:string) => void
  success: (text:string) => void
}

export interface IConfig {
  bindThis?: boolean
}

export interface ParsedParams { 
  [key: string]: string|boolean 
}

export interface ParseResult {
  parsedParams: ParsedParams
  flagArgumentQuantity: number
}