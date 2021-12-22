Blockly.Verilog['not_block'] = function(block) {
    var value_argument = Blockly.Verilog.valueToCode(block, 'argument', Blockly.Verilog.ORDER_ATOMIC);
    // TODO: Assemble Verilog into code variable.
    var code = `~(${value_argument})`;
    return code;
  };