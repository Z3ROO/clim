
export interface ICommand {
  name: string
  title?: string
  action: (options:any) => void
  description: string
  help?: string
  flags: {
    command?: string
    alias?: string
    type: 'stdin'|'string'|'boolean'
    description?: string
    help?: string
  }[]
  subCommands?: ICommand[]
}

export interface Params {
  [key: string]: string|boolean
};

export interface F {
  (text:string): void
  info: (text:string) => void
  err: (text:string) => void
  success: (text:string) => void
}

export interface IConfig {
  bindThis?: boolean
}