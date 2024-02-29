import { ICommand, Option, Params, ParseResult, ParsedParams } from "../types";

class ArgvParser {
  command: ICommand;
  params: Params = {};
  rawParameters: string[];

  constructor(command: ICommand, rawParameters: string[]) {
    this.command = command;
    this.rawParameters = rawParameters;
    let argumentsAvailable = Array.from(this.command.arguments);


    for (let i = 0; i < this.rawParameters.length; i++) {
      const parameter = this.rawParameters[i];
      const nextParemeter = this.rawParameters[i+1];

      if (this.isValidShortFlag(parameter)) {
        const {parsedParams, flagArgumentQuantity} = this.parseShortFlag(parameter, nextParemeter);
        Object.assign(this.params, parsedParams)
        i += flagArgumentQuantity;
      }
      else if (this.isValidFlag(parameter)) {
        const {parsedParams, flagArgumentQuantity} = this.parseFlag(parameter, nextParemeter);
        Object.assign(this.params, parsedParams)
        i += flagArgumentQuantity;
      }
      else if (argumentsAvailable.length > 0) {
        const { name } = argumentsAvailable.shift();
        this.params[name] = parameter;
      }
      else {
        throw new Error(`Unexpected Error on parameter "${parameter}". Might not be a valid option.`);
      }
    }
  }

  isValidShortFlag = (parameter: string) => parameter.match(/^-[^-]+$/);

  parseShortFlag(parameter: string, nextParemeter: string): ParseResult {
    const parsedParams: ParsedParams = {}
    //Remove dash character
    parameter = parameter.substring(1);

    //split string in case of group of short-flags
    let params: string[] = parameter.split('');

    //track if flag with argument was already used;
    let paramWithValue = false;

    params.forEach(param => {
      const option = this.findOption(param);

      //If expect argument
      if (option.type === 'string') {
        if (paramWithValue)
          throw new Error(`On option "-${param}"; Grouped options allow only one parameter that expects value.`);
        if (nextParemeter == null)
          throw new Error(`On option "-${param}"; The option "--${option.flag}" requires a value but got null or undefined`);

        parsedParams[option.flag] = nextParemeter;
        paramWithValue = true;
      }
      else //If boolean
        parsedParams[option.flag] = true;
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

    const option = this.findOption(parameter);
    
    //Flag with argument
    if (option.type === 'string') {
      if (nextParemeter == null)
        throw new Error(`On parameter "--${parameter}"; The option "--${option.flag}" requires a value but got null or undefined`);

      parsedParams[option.flag] = nextParemeter;
      return {
        parsedParams,
        flagArgumentQuantity: 0
      }

    }
    else //Flag boolean
      parsedParams[option.flag] = true;

    return {
      parsedParams,
      flagArgumentQuantity: 0
    }
  }

  findOption(param: string): Option {
    const options = this.command.options;

    const option = options.find(option => (param === option.flag || param === option.shortFlag));

    //option not found
    if (option == null)
      throw new Error(`No option found for parameter "${param}".`);

    //Flag set twice
    if (this.params[option.flag])
      throw new Error(`Option "--${option.flag}" is being set twice on parameter "${param}".`);

    return option;
  }
}

export default ArgvParser