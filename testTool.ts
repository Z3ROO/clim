import CliMaker, { ICommand } from './index';
console.log(CliMaker)
const command2: ICommand = {
  name: 'send',
  action: toolMethod,
  description: '',
  help: '',
  flags:[
    {
      type: 'stdin',
    },
    {
      command: 'config',
      alias: 'c',
      type: 'string',
      description: 'Configure the base directory to bring data of. When using bring ./path is the same as bring /path/passed/to/config/ + ./path',
      help:'-c or --config <path>'
    },
    {
      command: 'teste1',
      alias: 't',
      type: 'boolean',
    },
    {
      command: 'teste2',
      alias: 's',
      type: 'boolean',
    },
    {
      command: 'teste3',
      alias: 'a',
      type: 'boolean',
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
  flags:[
    {
      type: 'stdin',
      description: ''
    },
    {
      command: 'config',
      alias: 'c',
      type: 'string',
      description: 'Configure the base directory to bring data of. When using bring ./path is the same as bring /path/passed/to/config/ + ./path',
    },
    {
      command: 'recursive',
      alias: 'r',
      type: 'boolean',
      description: 'If this flag is present the behavior will be altered in a certain way.'
    },
    {
      command: 'thing',
      alias: 't',
      type: 'boolean',
      description: 'If this flag is present the behavior will be altered in a certain way.'
    },
    {
      command: 'other',
      alias: 'o',
      type: 'boolean',
      description: 'If this flag is present the behavior will be altered in a certain way.'
    }
  ],
  subCommands: [command2]
}

function toolMethod(options: any) {
  const {
    stdin,
    config
  } = options;

  if (stdin == null)
    this.log.err("Destination directory must be specified!");
}

const tool = new CliMaker(command)