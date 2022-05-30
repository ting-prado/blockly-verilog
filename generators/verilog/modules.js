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

goog.provide('Blockly.Verilog.modules');

goog.require('Blockly.Verilog');

Blockly.Verilog['modules_defnoreturn'] = function (block) {
  // Define a procedure with a return value.
  var modName = Blockly.Verilog.nameDB_.getName(
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

  let input = [];
  let output = [];
  let wire = [];
  block.getParamInfo().forEach((info) => {
    if (info.type == 'input') {
      input.push(
        Blockly.Verilog.nameDB_.getName(
          info.var_name,
          Blockly.VARIABLE_CATEGORY_NAME
        )
      );
    } else if (info.type == 'wire') {
      wire.push(
        Blockly.Verilog.nameDB_.getName(
          info.var_name,
          Blockly.VARIABLE_CATEGORY_NAME
        )
      );
    } else {
      output.push(
        Blockly.Verilog.nameDB_.getName(
          info.var_name,
          Blockly.VARIABLE_CATEGORY_NAME
        )
      );
    }
  });

  var code =
    'module ' +
    modName +
    '(' +
    input.join(', ') +
    (output.length > 0 && input.length > 0 ? ', ' : '') +
    output.join(', ') +
    ');\n\n' +
    xfix1 +
    loopTrap +
    (input.length > 0 ? 'input ' : '') +
    input.join(', ') +
    (input.length > 0 ? ';\n' : '') +
    (output.length > 0 ? 'output ' : '') +
    output.join(', ') +
    (output.length > 0 ? ';\n' : '') +
    (wire.length > 0 ? 'wire ' : '') +
    wire.join(', ') +
    (wire.length > 0 ? ';\n' : '') +
    '\n' +
    branch +
    xfix2 +
    returnValue +
    '\nendmodule';
  code = Blockly.Verilog.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Verilog.definitions_['%' + modName] = code;
  return null;
};

Blockly.Verilog['modules_callnoreturn'] = function (block) {
  // Call a module with no return value.
  var funcName = Blockly.Verilog.nameDB_.getName(
    block.getFieldValue('NAME'),
    Blockly.PROCEDURE_CATEGORY_NAME
  );

  var instance = block.getFieldValue('INSTANCE');

  var args = [];

  for (let i = 0; i < block.getInOut().length; i++) {
    if (block.getFieldValue('ARGD' + i) != 'INITIAL') {
      args[i] = block.getFieldValue('ARGD' + i);
    }
  }

  var code = funcName + ' ' + instance + '(' + args.join(', ') + ');\n';
  if (
    block.getSurroundParent() !== null &&
    block.getSurroundParent().type == 'modules_defnoreturn' &&
    block.getSurroundParent().getFieldValue('NAME') !==
      block.getFieldValue('NAME')
  ) {
    return code;
  } else return '';
};
