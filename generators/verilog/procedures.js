/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Verilog for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Verilog.procedures');

goog.require('Blockly.Verilog');

Blockly.Verilog['procedures_defreturn'] = function (block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Verilog.nameDB_.getName(
    block.getFieldValue('NAME'),
    Blockly.PROCEDURE_CATEGORY_NAME
  );
  var xfix1 = '';
  if (Blockly.Verilog.STATEMENT_PREFIX) {
    xfix1 += Blockly.Verilog.injectId(Blockly.Verilog.STATEMENT_PREFIX, block);
  }
  if (Blockly.Verilog.STATEMENT_SUFFIX) {
    xfix1 += Blockly.Verilog.injectId(Blockly.Verilog.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Blockly.Verilog.prefixLines(xfix1, Blockly.Verilog.INDENT);
  }
  var loopTrap = '';
  if (Blockly.Verilog.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.Verilog.prefixLines(
      Blockly.Verilog.injectId(Blockly.Verilog.INFINITE_LOOP_TRAP, block),
      Blockly.Verilog.INDENT
    );
  }
  var branch = Blockly.Verilog.statementToCode(block, 'STACK');
  var returnValue =
    Blockly.Verilog.valueToCode(block, 'RETURN', Blockly.Verilog.ORDER_NONE) ||
    '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.Verilog.INDENT + 'return ' + returnValue + ';\n';
  }
  var args = [];
  var variables = block.getVars();
  for (var i = 0; i < variables.length; i++) {
    args[i] = Blockly.Verilog.nameDB_.getName(
      variables[i],
      Blockly.VARIABLE_CATEGORY_NAME
    );
  }
  var code =
    'function ' +
    funcName +
    '(' +
    args.join(', ') +
    ') {\n' +
    xfix1 +
    loopTrap +
    branch +
    xfix2 +
    returnValue +
    '}';
  code = Blockly.Verilog.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Verilog.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Verilog['procedures_defnoreturn'] =
  Blockly.Verilog['procedures_defreturn'];

Blockly.Verilog['procedures_callreturn'] = function (block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Verilog.nameDB_.getName(
    block.getFieldValue('NAME'),
    Blockly.PROCEDURE_CATEGORY_NAME
  );
  var args = [];
  var variables = block.getVars();
  for (var i = 0; i < variables.length; i++) {
    args[i] = Blockly.Verilog.valueToCode(
      block,
      'ARG' + i,
      Blockly.Verilog.ORDER_NONE
    );
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Verilog.ORDER_FUNCTION_CALL];
};

Blockly.Verilog['procedures_callnoreturn'] = function (block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  var tuple = Blockly.Verilog['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

Blockly.Verilog['procedures_ifreturn'] = function (block) {
  // Conditionally return value from a procedure.
  var condition =
    Blockly.Verilog.valueToCode(
      block,
      'CONDITION',
      Blockly.Verilog.ORDER_NONE
    ) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (Blockly.Verilog.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Blockly.Verilog.prefixLines(
      Blockly.Verilog.injectId(Blockly.Verilog.STATEMENT_SUFFIX, block),
      Blockly.Verilog.INDENT
    );
  }
  if (block.hasReturnValue_) {
    var value =
      Blockly.Verilog.valueToCode(block, 'VALUE', Blockly.Verilog.ORDER_NONE) ||
      'null';
    code += Blockly.Verilog.INDENT + 'return ' + value + ';\n';
  } else {
    code += Blockly.Verilog.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
