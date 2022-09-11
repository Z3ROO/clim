import process from 'process';

export default class CliMaker {
  params: any;

  constructor(command: any) {
    this.params = {};
    
    this.parseParameters(command.flags);
    command.action(this.params)
  }

  parseParameters(flags:any):void {
    let rawParameters = process.argv.slice(2);

    //if subcommand check if the first param is a subcommand

    //loop through raw params matching with flags

    for (let i = 0; i < rawParameters.length; i++) {
      if (rawParameters[i].match(/^-[^-]+$/)) { // -fLgS 'value if necessary'
        let params: string[] = [rawParameters[i].substring(1)]

        if (params[0].length > 1) //is more than one flag
          params = [...params[0].split('')];
        
        let paramWithValue = false;
        params.forEach(param => {                 
          const flag = flags.find(flag => param === flag.alias);

          if (flag == null)
            throw new Error(`No command found for Param "${param}".`);
          
          if (this.params[flag.command])
            throw new Error(`Command "${flag.command}" is being set twice by param: "${param}".`);

          if (flag.type === 'string') {
            if (paramWithValue)
              throw new Error(`On param: "${param}". Grouped params accept only one param to expect value.`);
            if (rawParameters[i+1] == null)
              throw new Error(`On param "${param}" the command "${flag.command}" requires a value but got null or undefined`);

            this.params[flag.command] = rawParameters[i+1];
            paramWithValue = true;
          }
          else
            this.params[flag.command] = true;
        });
        
        if (paramWithValue)
          i++;
      }else if (rawParameters[i].match(/^--[^-]+.*/)) {
        const param = rawParameters[i].substring(2)
        const flag = flags.find(flag => param === flag.command);

        if (flag == null)
          throw new Error(`No command found for Param "${param}".`);

        if (this.params[flag.command])
          throw new Error(`Command "${flag.command}" is being set twice by param: "--${param}".`);
        
        if (flag.type === 'string') {
          if (rawParameters[i+1] == null)
            throw new Error(`On param "${param}" the command "${flag.command}" requires a value but got null or undefined`);

          this.params[flag.command] = rawParameters[i+1];
          i++
        }
        else
          this.params[flag.command] = true;
      }
      else if (!this.params['stdin']) {
        this.params['stdin'] = rawParameters[i];
      }
      else {
        throw new Error(`Error on parameter: "${rawParameters[i]}"`);
      }
    }
  }
}
