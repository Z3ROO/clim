import process from 'process';
import chalk from 'chalk';
import { LogFunction, ICommand, IConfig, Params } from './types';
import ArgvParser from './parser/ArgvParser';

// process.stdin.setEncoding('utf8');

// let inputData = '';

// process.stdin.on('readable', () => {
//   const chunk = process.stdin.read();
//   if (chunk !== null) {
//     inputData += chunk;
//   }
// });

// process.stdin.on('end', () => {
//   // Do something with the input data
//   console.log('Received data:', inputData);
// });

export * from './types';

export default class CliMaker {
  params: Params = {};
  command: ICommand;
  rawParameters = process.argv.slice(2);

  constructor(command: ICommand, config?: IConfig) {
    this.command = command;

    //Make a subcommand into a command
    this.liftSubCommands();

    this.setCustomLogs();
    this.setDefaultOptions();

    this.params = this.parseParameters();

    //If help command is present, it prints an overall instructions of the command and exit with code 0;
    if (this.params.help)
      this.help();

    //Binds command function with class constructor by default
    if (config?.bindThis !== false)
      this.command.action.bind(this)(this.params);
    else
      this.command.action(this.params);
  }

  private liftSubCommands(): void {
    const subCommands = this.command.subCommands;

    for (let i = 0; i < subCommands.length; i++) {
      if (this.rawParameters[0] === subCommands[i].name) {
        this.rawParameters = this.rawParameters.slice(1);
        this.command = subCommands[i];
        return this.liftSubCommands();
      }
    }
  }

  private parseParameters(): Params {
    let parsedParameters: ArgvParser;

    try {
      parsedParameters = new ArgvParser(this.command, this.rawParameters);
    }
    catch(err) {
      this.log.err(err);
    }

    return parsedParameters.params;
  }

  public log = <LogFunction>function (text:string) {
    console.log(chalk.bold.cyan(text));
  }

  private setDefaultOptions() {
    this.command.options = [
      {
        flag: 'help',
        shortFlag: 'h',
        type: 'boolean',
        description: 'If provided outputs de help content of current command.'
      },
      ...this.command.options
    ];
  }

  private setCustomLogs() {
    this.log.info = (text) => console.log(chalk.bold.blue('\u{1f6c8} '+text));
    this.log.success = (text) => console.log(chalk.bold.green('\u2713 '+text));
    this.log.err = (text) => {
      console.log(chalk.bold.red('\u00d7 '+text));
      process.exit(1);
    };
  }

  private help() {
    this.log('\n' + chalk.inverse(this.command.title || this.command.name) + '\n');
    
    if (this.command.description)
      this.log(this.command.description);
    
    if (this.command.help)
      this.log(this.command.help+'\n');
    
    this.log('Options:')
    this.command.options.forEach(option => {
      // if (option.type === 'stdin')
      //   return;

      const help = option.help ? option.help : `${chalk.bold.blueBright('--'+option.flag)} or ${chalk.bold.blueBright('-'+option.shortFlag)}`;
      const description = option.description;

      this.log(`${help} ${description && '| ' + description} \n`);
    })

    process.exit(0);
  }
}

