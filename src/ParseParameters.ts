import { ICommand, Params } from "./types";

class ParseParameters {
  command: ICommand;
  params: Params = {};
  rawParameters: string[];

  constructor(command: ICommand, rawParameters: string[]) {
    this.command = command;
    this.rawParameters = rawParameters;

    this.command.flags = [
      {
        command: 'help',
        alias: 'h',
        type: 'boolean',
        description: 'If provided outputs de help content of current command.'
      },
      ...this.command.flags
    ];

    for (let i = 0; i < this.rawParameters.length; i++) {
      if (this.isValidAlias(i))
        i += this.parseAlias(i);
      else if (this.isValidFlag(i)) 
        i += this.parseFlag(i);
      else if (!this.params['stdin'])
        this.params['stdin'] = this.rawParameters[i];
      else
        throw new Error(`Unexpected Error on parameter "${this.rawParameters[i]}". Might not be a valid option.`);
    }
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
        throw new Error(`No option found for parameter "${param}".`);
      
      if (this.params[flag.command])
        throw new Error(`Option "--${flag.command}" is being set twice on parameter "-${param}".`);

      if (flag.type === 'string') {
        if (paramWithValue)
          throw new Error(`On option "-${param}"; Grouped options allow only one parameter that expects value.`);
        if (this.rawParameters[paramIndex+1] == null)
          throw new Error(`On option "-${param}"; The option "--${flag.command}" requires a value but got null or undefined`);

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

  isValidFlag = (i:number) => this.rawParameters[i].match(/^--[^-]+.*/);

  parseFlag(paramIndex: number): number {
    const param = this.rawParameters[paramIndex].substring(2);
    const flag = this.command.flags.find(flag => param === flag.command);

    if (flag == null)
      throw new Error(`No option found for parameter "${param}".`);

    if (this.params[flag.command])
      throw new Error(`Option "--${flag.command}" is being set twice by param: "--${param}".`);
    
    if (flag.type === 'string') {
      if (this.rawParameters[paramIndex+1] == null)
        throw new Error(`On parameter "--${param}"; The option "--${flag.command}" requires a value but got null or undefined`);

      this.params[flag.command] = this.rawParameters[paramIndex+1];
      return 1;
    }
    else
      this.params[flag.command] = true;
    
    return 0;
  }
}

export default ParseParameters