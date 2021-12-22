/**
*@license
*Visual Blocks Programming
*
* Copyright 2019 Google Inc.
* https://developers.google.com/blockly/
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
'use strict';

goog.provide('Blockly.Verilog');

goog.require('Blockly.Generator');
goog.require('Blockly.inputTypes');
goog.require('Blockly.utils.global');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.string');


/**
 * Verilog code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Verilog = new Blockly.Generator('Verilog');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */

Blockly.Verilog.addReservedWords(
    'Verilog,' +
    //Keywords(http://www.csit-sun.pub.ro/courses/Masterat/Materiale_Suplimentare/Xilinx%20Synthesis%20Technology/toolbox.xilinx.com/docsan/xilinx4/data/docs/xst/verilog10.html)
    'always,and,assign,begin,buf,bufif0,bufif1,case,casex,casez,cmos,deassign,default,defparam,' + 
    'disable,edge,else,end,endcase,endmodule,endfunction,endprimitive,endspecify,endtable,' +
    'endtask,event,for,force,forever,for,function,highz0,highz1,if,ifnone,initial,inout,input,' +
    'integer,joib,large,macromodule,medium,module,nand,negedge,nmos,nor,not,notif0,notif1,or,' +
    'output,parameter,pmos,posedge,primitive,pull0,pull1,pullup,pulldown,rcmos,real,realtime,reg,' +
    'release,repeat,rnmos,rpmos,rtran,rtranif0,rtranif1,scalared,small,specify,specparam,strong0,' +
    'strong1,supply0,supply1,table,task,time,tran,tranif0,tranif1,tri,tri0,tri1,triand,trior,' +
    'trireg,vectored,wait,wand,weak0,weak1,while,wire,wor,xnor,xor'
)

/**
 * Order of operation ENUMs
 * https://class.ece.uw.edu/cadta/verilog/operators.html
 */
 Blockly.Verilog.ORDER_ATOMIC = 0;            //literals  
 Blockly.Verilog.ORDER_MEMBER = 1;            //[]
 Blockly.Verilog.ORDER_BRACKET = 2;           //()
 Blockly.Verilog.ORDER_LOGICNEG = 3;          //!
 Blockly.Verilog.ORDER_NEG = 3;               //~
 Blockly.Verilog.ORDER_AND = 3;               //&
 Blockly.Verilog.ORDER_OR = 3;                //|
 Blockly.Verilog.ORDER_NAND = 3;              //~&
 Blockly.Verilog.ORDER_NOR = 3;               //~|
 Blockly.Verilog.ORDER_XOR = 3;               //^
 Blockly.Verilog.ORDER_XNOR = 3;              //~^ or ^~
 Blockly.Verilog.ORDER_UNARY_PLUS = 4;        //+
 Blockly.Verilog.ORDER_UNARY_MINUS = 4;       //-
 Blockly.Verilog.ORDER_CONCAT = 5;            //{}
 Blockly.Verilog.ORDER_REPLICA = 6;           //{{}}
 Blockly.Verilog.ORDER_MULT = 7;              //*
 Blockly.Verilog.ORDER_DIV = 7;               ///
 Blockly.Verilog.ORDER_MOD = 7;               //%
 Blockly.Verilog.ORDER_BINARY_PLUS = 8;       //+
 Blockly.Verilog.ORDER_BINARY_MINUS = 8;      //-
 Blockly.Verilog.ORDER_SHIFT_LEFT = 9;        //<<
 Blockly.Verilog.ORDER_SHIFT_RIGHT = 9;       //>>
 Blockly.Verilog.ORDER_GREATER_THAN = 10;     //>
 Blockly.Verilog.ORDER_GREATER_THAN_EQ = 10;  //>=
 Blockly.Verilog.ORDER_LESS_THAN = 10;        //<
 Blockly.Verilog.ORDER_LESS_THAN_EQ = 10;     //<=
 Blockly.Verilog.ORDER_LOGIC_EQ = 11;         //==
 Blockly.Verilog.ORDER_LOGIC_INEQ =11;        //!=
 Blockly.Verilog.ORDER_CASE_EQ = 12;          //===
 Blockly.Verilog.ORDER_CASE_INEQ = 12;        //!==
 Blockly.Verilog.ORDER_BITWISE_AND = 13;      //&
 Blockly.Verilog.ORDER_BITWISE_XOR = 14;      //^
 Blockly.Verilog.ORDER_BITWISE_XNOR = 14;     //^~ or ~^
 Blockly.Verilog.ORDER_BITWISE_OR = 15;       //|
 Blockly.Verilog.ORDER_LOGIC_AND = 16;        //&&
 Blockly.Verilog.ORDER_LOGIC_OR = 17;         //||
 Blockly.Verilog.ORDER_CONDITIONAL = 18;      //?:
 Blockly.Verilog.ORDER_NONE = 99;

/** 
* Whether the init method has been called
@type {?boolean} 
*/
Blockly.Verilog.isInitialized = false;

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Verilog.init = function(workspace) {
    //Call Blockly.Generator's init
    Object.getPrototypeOf(this).init.call(this);

    if(!this.nameDB_) {
        this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
    }
    else {
        this.nameDB_.reset();
    }
    this.nameDB_.setVariableMap(workspace.getVariableMap());
    this.nameDB_.populateVariables(workspace);
    this.nameDB_.populateProcedures(workspace);

    var defvars = [];
    // Add developer variables (not created or named by the user).
    var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
    for (var i = 0; i < devVarList.length; i++) {
      defvars.push(this.nameDB_.getName(devVarList[i],
          Blockly.Names.DEVELOPER_VARIABLE_TYPE));
    }
  
    // Add user variables, but only ones that are being used.
    var variables = Blockly.Variables.allUsedVarModels(workspace);
    for (var i = 0; i < variables.length; i++) {
      defvars.push(this.nameDB_.getName(variables[i].getId(),
          Blockly.VARIABLE_CATEGORY_NAME));
    }
  
    // Declare all of the variables.
    if (defvars.length) {
      this.definitions_['variables'] = 'var ' + defvars.join(', ') + ';';
    }
    
    this.isInitialized = true;
}

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Verilog.finish = function(code) {
   // Convert the definitions dictionary into a list.
   var definitions = Blockly.utils.object.values(this.definitions_);
   // Call Blockly.Generator's finish.
   code = Object.getPrototypeOf(this).finish.call(this, code);
   this.isInitialized = false;
 
   this.nameDB_.reset();
   return definitions.join('\n\n') + '\n\n\n' + code;
}

/**
* Naked values are top-level blocks with outputs that aren't plugged into
* anything.  A trailing semicolon is needed to make this legal.
* @param {string} line Line of generated code.
* @return {string} Legal line of code.
*/
Blockly.Verilog.scrubNakedValue = function(line) {
    return line + ';\n';
}

/**
* Encode a string as a properly escaped Verilog string, complete with
* quotes.
* @param {string} string Text to encode.
* @return {string} Verilog string.
* @protected
*/
Blockly.Verilog.quote_ = function(string) {
   string = string.replace(/\\/g, '\\\\')
                  .replace(/\n/g, '\\\n')
                  .replace(/'/g, '\\\'');
   return '\'' + string + '\'';
}

/**
* Common tasks for generating Verilog from blocks.
* Handles comments for the specified block and any connected value blocks.
* Calls any statements following this block.
* @param {!Blockly.Block} block The current block.
* @param {string} code The Verilog code created for this block.
* @param {boolean=} opt_thisOnly True to generate code for only this statement.
* @return {string} Verilog code with comments and subsequent blocks added.
* @protected
*/
Blockly.Verilog.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
      commentCode += this.prefixLines(comment + '\n', '// ');
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.inputTypes.VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = this.allNestedComments(childBlock);
          if (comment) {
            commentCode += this.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? '' : this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
}