import process from 'process';
import chalk from 'chalk';

export interface ICommand {
  name: string
  title?: string
  action: (options:any) => void
  description: string
  help: string
  flags: {
    command?: string
    alias?: string
    type: 'stdin'|'string'|'boolean'
    description?: string
    help?: string
  }[]
  subCommands?: ICommand[]
}

export interface F {
  (text:string): void
  info: (text:string) => void
  err: (text:string) => void
  success: (text:string) => void
}

export default class CliMaker {
  params: {
    [key: string]: string|boolean
  } = {};
  command: ICommand;
  rawParameters: string[];


  constructor(command: any) {
    this.command = command;
    this.rawParameters = process.argv.slice(2);

    this.log.info = (text) => console.log(chalk.bold.blue('\u{1f6c8} '+text));
    this.log.success = (text) => console.log(chalk.bold.green('\u2713 '+text));
    this.log.err = (text) => {
      console.log(chalk.bold.red('\u00d7 '+text))
      process.exit(1);
    };

    this.parseParameters();
    if (this.params.help)
      this.help()
    else
      command.action.bind(this)(this.params) 
  }

  log = <F>function (text:string) {
    console.log(chalk.bold.cyan(text));
  }

  parseParameters():void {
    const subCommands = this.command.subCommands;

    for (let i = 0; i < subCommands.length; i++) {
      if (this.rawParameters[0] === subCommands[i].name) {
        this.rawParameters = this.rawParameters.slice(1);
        this.command = subCommands[i];
        return this.parseParameters();
      }
    }

    this.command.flags = [
      {
        command: 'help',
        alias: 'h',
        type: 'boolean',
        description: 'If used with command it outputs de help content of current command.'
      },
      ...this.command.flags
    ];

    for (let i = 0; i < this.rawParameters.length; i++) {
      if (this.isValidAlias(i))
        i += this.parseAlias(i);
      else if (this.isValidCommand(i)) 
        i += this.parseCommand(i);
      else if (!this.params['stdin'])
        this.params['stdin'] = this.rawParameters[i];
      else
        this.log.err(`Unexpected Error on parameter "${this.rawParameters[i]}"`);
    }
  }

  help() {
    this.log('\n' + chalk.inverse(this.command.title || this.command.name) + '\n');
    
    if (this.command.description)
      this.log(this.command.description);
    
    if (this.command.help)
      this.log(this.command.help+'\n');
    
    this.log('Options:')
    this.command.flags.forEach(flag => {
      if (flag.type === 'stdin')
        return

      const help = flag.help ? flag.help : `${chalk.bold.blueBright('--'+flag.command)} or ${chalk.bold.blueBright('-'+flag.alias)}`;
      const description = flag.description;

      this.log(`${help} ${description && '| '+description} \n`);
    })
  }

  isValidAlias = (i:number) => this.rawParameters[i].match(/^-[^-]+$/);

  parseAlias(paramIndex:number): number {
    const flags = this.command.flags;
    let params: string[] = [this.rawParameters[paramIndex].substring(1)]

    if (params[0].length > 1)
      params = [...params[0].split('')];
    
    let paramWithValue = false;
    params.forEach(param => {                 
      const flag = flags.find(flag => param === flag.alias);

      if (flag == null)
        this.log.err(`No command found for parameter "${param}".`);
      
      if (this.params[flag.command])
        this.log.err(`Command "--${flag.command}" is being set twice on parameter "-${param}".`);

      if (flag.type === 'string') {
        if (paramWithValue)
          this.log.err(`On parameter "-${param}"; Grouped options allow only one parameter to expect value.`);
        if (this.rawParameters[paramIndex+1] == null)
          this.log.err(`On parameter "-${param}"; The command "--${flag.command}" requires a value but got null or undefined`);

        this.params[flag.command] = this.rawParameters[paramIndex+1];
        paramWithValue = true;
      }
      else
        this.params[flag.command] = true;
    });
    
    if (paramWithValue)
      return 1;
    else
      return 0;
  }

  isValidCommand = (i:number) => this.rawParameters[i].match(/^--[^-]+.*/);

  parseCommand(paramIndex: number): number {
    const param = this.rawParameters[paramIndex].substring(2);
    const flag = this.command.flags.find(flag => param === flag.command);

    if (flag == null)
      this.log.err(`No command found for parameter "${param}".`);

    if (this.params[flag.command])
      this.log.err(`Command "--${flag.command}" is being set twice by param: "--${param}".`);
    
    if (flag.type === 'string') {
      if (this.rawParameters[paramIndex+1] == null)
        this.log.err(`On parameter "--${param}"; The command "--${flag.command}" requires a value but got null or undefined`);

      this.params[flag.command] = this.rawParameters[paramIndex+1];
      return 1;
    }
    else
      this.params[flag.command] = true;
    
    return 0;
  }
}

module.exports = CliMaker