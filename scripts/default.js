var FullCode = "",
    TempVar = 0,
    CodeText,
    OutputText;

var TYPE = {
	NONE: 0,
	BLOCK: {
		START: 1,
		END: 2,
		BOTH: 3
		CONTROL: 4
	},
    ASSIGN: 5,
    FUNCTION: 6
};

$(document).ready(function() {
	CodeText = $("#CodeText");
	OutputText = $("#OutputText");
	loadInitalCode();
	console.log("Loaded");
});

function loadInitalCode() {
	CodeText.val("print \"Hello\"\nif true\n  print \"World\"\nend");
}

function resetVariables() {
	FullCode = "";
	TempVar = 0;
}

function runCode() {
	resetVariables();
	clearScreen();
	var code = CodeText.val();
	var tree = parseCode(code);
	
}

function parseCode(code) {
	var state = createState();
	var lines = code.split("\n");
	
	for (var i = 0; i < lines.length; i++) {
		line = lines[i];
		if (line.length == 0)
			continue;

		var token = parseLine(line);
		if (token.type == TYPE.BLOCK.END || token.type == TYPE.BLOCK.BOTH) {
			state.popScope()
		}
		token = state.getScope();
		if (token.type == TYPE.BLOCK.START || token.type == TYPE.BLOCK.BOTH) {
			state.pushScope()
		}

		FullCode += parseCommand(command, parts);
	}
	try {
		console.log(FullCode);
		eval(FullCode);
	} catch (error) {
		writeError("Error during run :(\n" + error);
	}
}

function parseLine(line) {
	var command = line.split(" ", 1);
	var args = line.substring(command.length);
	switch (command) {
		case "if":
			return { 
				cmd: "if",
				type: TYPE.BLOCK.START,
				args: args,
				code: "if ({0}) {"
			};
		case "elseif":
			return {
				cmd: "elseif",
				type: TYPE.BLOCK.BOTH,
				args: args,
				code: "} else if ({0}) {"
			};
		case "else":
			return {
				cmd: "else",
				type: TYPE.BLOCK.BOTH,
				args: args,
				code: "} else {"
			};
		case "while":
			return {
				cmd: "while",
				type: TYPE.BLOCK.START,
				args: args,
				code: "while ({0}) {";
			};		
		case "end":
			return {
				cmd: "end",
				type: TYPE.BLOCK.END,
				args: args,
				code: "}"
			};
		case "break":
			return {
				cmd: "break",
				type: TYPE.BLOCK.CONTROL,
				args: args,
				code: "break;"
			};
		case "continue":
			return {
				cmd: "continue",
				type: TYPE.BLOCK.CONTROL,
				args: args,
				code: "continue;";
			};
		case "print":
			return {
				cmd: "print",
				type: TYPE.FUNCTION,
				args: args,
				code: "writeLine({0});";
			};
		default:
			return {
				cmd: "set",
				type: TYPE.ASSIGN,
				args: args,
				code: "state.setVar(" + command + ",{0});"
			};
	}
}

function splitBySpace(line) {
	return line.match(/\w+|"(?:\\"|[^"])+"/g); // Split by spaces keeping quotes
}

/***************************
***** Internal Methods *****
***************************/

function createState() {
	var globalVars = {}, // Global variables
	    internalVars = Array(), // Internal variables
	    scope = 0; // Are we inside any blocks (if, while, for, etc)
	
	// Global variable function
	this.setVar = function(name, value) {
		globalVars[name] = value;
	};

	this.getVar = function(name) {
		return globalVars[name];
	};

	this.varExists = function(name) {
		return globalVars[name] == undefined;
	};

	// Internal Variable functions
	this.newIVar = function() {
		return internalVars.length;
	};

	this.getIVar = function(index) {
		return internalVars[index];
	};

	// Scope functions
	this.pushScope = function() {
		scope++;
	};

	this.popScope = function() {
		scope--;
	};

	this.getScope = function() {
		return scope;
	};
}

function getTempVar() {
	return "a" + TempVar++;
}

function writeLine(text) {
	OutputText.val(OutputText.val() + text + "\n");	
}

function clearScreen () {
	OutputText.removeClass("error");
	OutputText.val("");
}

function writeError(error) {
	clearScreen();
	OutputText.addClass("error");
	writeLine(error);
}

