import { ICommand, Option, Params, ParseResult, ParsedParams } from "../types";

class ArgvParser {
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
      const parameter = this.rawParameters[i];
      const nextParemeter = this.rawParameters[i+1];

      if (this.isValidAlias(parameter)) {
        const {parsedParams, flagArgumentQuantity} = this.parseAlias(parameter, nextParemeter);
        Object.assign(this.params, parsedParams)
        i += flagArgumentQuantity;
      }
      else if (this.isValidFlag(parameter)) {
        const {parsedParams, flagArgumentQuantity} = this.parseFlag(parameter, nextParemeter);
        Object.assign(this.params, parsedParams)
        i += flagArgumentQuantity;
      }
      else if (!this.params['stdin']) {
        this.params['stdin'] = parameter;
      }
      else {
        throw new Error(`Unexpected Error on parameter "${parameter}". Might not be a valid option.`);
      }
    }
  }

  isValidAlias = (parameter: string) => parameter.match(/^-[^-]+$/);

  parseAlias(parameter: string, nextParemeter: string): ParseResult {
    const parsedParams: ParsedParams = {}
    //Remove dash character
    parameter = parameter.substring(1);

    //split string in case of group of short-flags
    let params: string[] = parameter.split('');

    //track if flag with argument was already used;
    let paramWithValue = false;

    params.forEach(param => {
      const flag = this.findFlag(param);

      //If expect argument
      if (flag.type === 'string') {
        if (paramWithValue)
          throw new Error(`On option "-${param}"; Grouped options allow only one parameter that expects value.`);
        if (nextParemeter == null)
          throw new Error(`On option "-${param}"; The option "--${flag.command}" requires a value but got null or undefined`);

        parsedParams[flag.command] = nextParemeter;
        paramWithValue = true;
      }
      else //If boolean
        parsedParams[flag.command] = true;
    });

    return {
      parsedParams,
      flagArgumentQuantity: paramWithValue ? 1 : 0
    }
  }

  isValidFlag = (parameter: string) => parameter.match(/^--[^-]+.*/);

  parseFlag(parameter: string, nextParemeter: string): ParseResult {
    const parsedParams: ParsedParams = {}
    //Remove double dash
    parameter = parameter.substring(2);

    const flag = this.findFlag(parameter);
    
    //Flag with argument
    if (flag.type === 'string') {
      if (nextParemeter == null)
        throw new Error(`On parameter "--${parameter}"; The option "--${flag.command}" requires a value but got null or undefined`);

      parsedParams[flag.command] = nextParemeter;
      return {
        parsedParams,
        flagArgumentQuantity: 0
      }

    }
    else //Flag boolean
      parsedParams[flag.command] = true;

    return {
      parsedParams,
      flagArgumentQuantity: 0
    }
  }

  findFlag(param: string): Option {
    const flags = this.command.flags;

    const flag = flags.find(flag => param === flag.alias);

    //Flag not found
    if (flag == null)
      throw new Error(`No option found for parameter "${param}".`);

    //Flag set twice
    if (this.params[flag.command])
      throw new Error(`Option "--${flag.command}" is being set twice on parameter "-${param}".`);

    return flag;
  }
}

export default ArgvParser