import process from 'process';
import chalk from 'chalk';
import { LogFunction, ICommand, IConfig, Params } from './types';
import ParseParameters from './ParseParameters';

export * from './types';

export default class CliMaker {
  params: Params = {};
  command: ICommand;
  rawParameters = process.argv.slice(2);

  constructor(command: ICommand, config?: IConfig) {
    this.command = command;

    this.setCustomLogs();
    this.liftSubCommands();
    this.parseParameters();
    
    //If help command is included prints an overall instructions of the command and exit with code 0;
    if (this.params.help)
      this.help();

    //Binds command function with class constructor by default
    if (config?.bindThis !== false)
      command.action.bind(this)(this.params);
    else
      command.action(this.params);
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

  private parseParameters(): void {
    let parsedParameters: ParseParameters;

    try {
      parsedParameters = new ParseParameters(this.command, this.rawParameters);
    }
    catch(err) {
      this.log.err(err);
    }

    this.params = parsedParameters.params;
  }

  public log = <LogFunction>function (text:string) {
    console.log(chalk.bold.cyan(text));
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
    this.command.flags.forEach(flag => {
      if (flag.type === 'stdin')
        return;

      const help = flag.help ? flag.help : `${chalk.bold.blueBright('--'+flag.command)} or ${chalk.bold.blueBright('-'+flag.alias)}`;
      const description = flag.description;

      this.log(`${help} ${description && '| '+description} \n`);
    })

    process.exit(0);
  }
}

