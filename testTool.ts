import CliMaker, { ICommand } from './dist/index.js';

const command2: ICommand = {
  name: 'send',
  action: toolMethod2,
  description: '',
  help: 'Messagem de help',
  arguments: [],
  options:[
    {
      flag: 'config',
      shortFlag: 'c',
      type: 'string',
      description: 'Configure the base directory to bring data of. When using bring ./path is the same as bring /path/passed/to/config/ + ./path',
      help:'-c or --config <path>'
    },
    {
      flag: 'teste1',
      shortFlag: 't',
      type: 'boolean',
    },
    {
      flag: 'teste2',
      shortFlag: 's',
      type: 'boolean',
    },
    {
      flag: 'teste3',
      shortFlag: 'a',
      type: 'string',
    }
  ],
  subCommands: []
}

const command: ICommand = {
  name: 'bring',
  title: 'Bring - CLI',
  action: toolMethod,  
  description: 'The command description',
  help: 'Ex: bring [path/to/bring/from]',
  arguments: [
    {
      name: 'directory',
      type: 'argument',
      description: 'description of directory for some shit',
      help: 'directory for some shit'
    },
    {
      name: 'directory2',
      type: 'argument',
      description: 'description of directory for some shit',
      help: 'directory for some shit'
    }
  ],
  options:[
    {
      flag: 'config',
      shortFlag: 'c',
      type: 'string',
      description: 'Configure the base directory to bring data of. When using bring ./path is the same as bring /path/passed/to/config/ + ./path',
    },
    {
      flag: 'recursive',
      shortFlag: 'r',
      type: 'boolean',
      description: 'If this flag is present the behavior will be altered in a certain way.'
    },
    {
      flag: 'thing',
      shortFlag: 't',
      type: 'boolean',
      description: 'If this flag is present the behavior will be altered in a certain way.'
    },
    {
      flag: 'other',
      shortFlag: 'o',
      type: 'boolean',
      description: 'If this flag is present the behavior will be altered in a certain way.'
    }
  ],
  subCommands: [command2]
}

function toolMethod(options: any) {
  const {
    directory,
    config
  } = options;
  console.log(options);
  // console.log(this);
  if (directory == null) 
    this.log.err("Destination directory must be specified!");
}

function toolMethod2(options: any) {
  console.log("deu bom");
}


const tool = new CliMaker(command)
