"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var process_1 = require("process");
var chalk_1 = require("chalk");
var CliMaker = /** @class */ (function () {
    function CliMaker(command) {
        var _this = this;
        this.params = {};
        this.log = function (text) {
            console.log(chalk_1["default"].bold.cyan(text));
        };
        this.isValidAlias = function (i) { return _this.rawParameters[i].match(/^-[^-]+$/); };
        this.isValidCommand = function (i) { return _this.rawParameters[i].match(/^--[^-]+.*/); };
        this.command = command;
        this.rawParameters = process_1["default"].argv.slice(2);
        this.log.info = function (text) { return console.log(chalk_1["default"].bold.blue("\uD83D\uDEC8 " + text)); };
        this.log.success = function (text) { return console.log(chalk_1["default"].bold.green('\u2713 ' + text)); };
        this.log.err = function (text) {
            console.log(chalk_1["default"].bold.red('\u00d7 ' + text));
            process_1["default"].exit(1);
        };
        this.parseParameters();
        if (this.params.help)
            this.help();
        else
            command.action.bind(this)(this.params);
    }
    CliMaker.prototype.parseParameters = function () {
        var subCommands = this.command.subCommands;
        for (var i = 0; i < subCommands.length; i++) {
            if (this.rawParameters[0] === subCommands[i].name) {
                this.rawParameters = this.rawParameters.slice(1);
                this.command = subCommands[i];
                return this.parseParameters();
            }
        }
        this.command.flags = __spreadArray([
            {
                command: 'help',
                alias: 'h',
                type: 'boolean',
                description: 'If used with command it outputs de help content of current command.'
            }
        ], this.command.flags, true);
        for (var i = 0; i < this.rawParameters.length; i++) {
            if (this.isValidAlias(i))
                i += this.parseAlias(i);
            else if (this.isValidCommand(i))
                i += this.parseCommand(i);
            else if (!this.params['stdin'])
                this.params['stdin'] = this.rawParameters[i];
            else
                this.log.err("Unexpected Error on parameter \"".concat(this.rawParameters[i], "\""));
        }
    };
    CliMaker.prototype.help = function () {
        var _this = this;
        this.log('\n' + chalk_1["default"].inverse(this.command.title || this.command.name) + '\n');
        if (this.command.description)
            this.log(this.command.description);
        if (this.command.help)
            this.log(this.command.help + '\n');
        this.log('Options:');
        this.command.flags.forEach(function (flag) {
            if (flag.type === 'stdin')
                return;
            var help = flag.help ? flag.help : "".concat(chalk_1["default"].bold.blueBright('--' + flag.command), " or ").concat(chalk_1["default"].bold.blueBright('-' + flag.alias));
            var description = flag.description;
            _this.log("".concat(help, " ").concat(description && '| ' + description, " \n"));
        });
    };
    CliMaker.prototype.parseAlias = function (paramIndex) {
        var _this = this;
        var flags = this.command.flags;
        var params = [this.rawParameters[paramIndex].substring(1)];
        if (params[0].length > 1)
            params = __spreadArray([], params[0].split(''), true);
        var paramWithValue = false;
        params.forEach(function (param) {
            var flag = flags.find(function (flag) { return param === flag.alias; });
            if (flag == null)
                _this.log.err("No command found for parameter \"".concat(param, "\"."));
            if (_this.params[flag.command])
                _this.log.err("Command \"--".concat(flag.command, "\" is being set twice on parameter \"-").concat(param, "\"."));
            if (flag.type === 'string') {
                if (paramWithValue)
                    _this.log.err("On parameter \"-".concat(param, "\"; Grouped options allow only one parameter to expect value."));
                if (_this.rawParameters[paramIndex + 1] == null)
                    _this.log.err("On parameter \"-".concat(param, "\"; The command \"--").concat(flag.command, "\" requires a value but got null or undefined"));
                _this.params[flag.command] = _this.rawParameters[paramIndex + 1];
                paramWithValue = true;
            }
            else
                _this.params[flag.command] = true;
        });
        if (paramWithValue)
            return 1;
        else
            return 0;
    };
    CliMaker.prototype.parseCommand = function (paramIndex) {
        var param = this.rawParameters[paramIndex].substring(2);
        var flag = this.command.flags.find(function (flag) { return param === flag.command; });
        if (flag == null)
            this.log.err("No command found for parameter \"".concat(param, "\"."));
        if (this.params[flag.command])
            this.log.err("Command \"--".concat(flag.command, "\" is being set twice by param: \"--").concat(param, "\"."));
        if (flag.type === 'string') {
            if (this.rawParameters[paramIndex + 1] == null)
                this.log.err("On parameter \"--".concat(param, "\"; The command \"--").concat(flag.command, "\" requires a value but got null or undefined"));
            this.params[flag.command] = this.rawParameters[paramIndex + 1];
            return 1;
        }
        else
            this.params[flag.command] = true;
        return 0;
    };
    return CliMaker;
}());
exports["default"] = CliMaker;
