/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Logic blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Constants.Conditional');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['LOGIC_HUE']. (2018 April 5)
 */
Blockly.Constants.Logic.HUE = 210;

Blockly.defineBlocksWithJsonArray([
  // BEGIN JSON EXTRACT
  // Block for if/elseif/else condition.
  {
    type: 'conditional_block',
    message0: '%{BKY_CONTROLS_IF_MSG_IF} %1',
    args0: [
      {
        type: 'field_input',
        name: 'STATEMENT',
        text: 'statement',
      },
    ],
    message1: '%{BKY_CONTROLS_IF_MSG_THEN} %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO0',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'logic_blocks',
    helpUrl: '%{BKY_CONTROLS_IF_HELPURL}',
    mutator: 'conditional_block_mutator',
    extensions: ['conditional_block_tooltip'],
  },
]); // END JSON EXTRACT (Do not delete this comment.)

Blockly.defineBlocksWithJsonArray([
  // Mutator blocks. Do not extract.
  // Block representing the if statement in the conditional_block mutator.
  {
    type: 'conditional_block_if',
    message0: '%{BKY_CONTROLS_IF_IF_TITLE_IF}',
    nextStatement: null,
    enableContextMenu: false,
    style: 'logic_blocks',
    tooltip: '%{BKY_CONTROLS_IF_IF_TOOLTIP}',
  },
  // Block representing the else-if statement in the conditional_block mutator.
  {
    type: 'conditional_block_elseif',
    message0: '%{BKY_CONTROLS_IF_ELSEIF_TITLE_ELSEIF}',
    previousStatement: null,
    nextStatement: null,
    enableContextMenu: false,
    style: 'logic_blocks',
    tooltip: '%{BKY_CONTROLS_IF_ELSEIF_TOOLTIP}',
  },
  // Block representing the else statement in the conditional_block mutator.
  {
    type: 'conditional_block_else',
    message0: '%{BKY_CONTROLS_IF_ELSE_TITLE_ELSE}',
    previousStatement: null,
    enableContextMenu: false,
    style: 'logic_blocks',
    tooltip: '%{BKY_CONTROLS_IF_ELSE_TOOLTIP}',
  },
]);
/**
 * Mutator methods added to conditional_block blocks.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.Constants.Logic.CONTROLS_IF_MUTATOR_MIXIN = {
  elseifCount_: 0,
  elseCount_: 0,

  /**
   * Don't automatically add STATEMENT_PREFIX and STATEMENT_SUFFIX to generated
   * code.  These will be handled manually in this block's generators.
   */
  suppressPrefixSuffix: true,

  /**
   * Create XML to represent the number of else-if and else inputs.
   * @return {Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    if (!this.elseifCount_ && !this.elseCount_) {
      return null;
    }
    var container = Blockly.utils.xml.createElement('mutation');
    if (this.elseifCount_) {
      container.setAttribute('elseif', this.elseifCount_);
    }
    if (this.elseCount_) {
      container.setAttribute('else', 1);
    }
    return container;
  },
  /**
   * Parse XML to restore the else-if and else inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
    this.elseCount_ = parseInt(xmlElement.getAttribute('else'), 10) || 0;
    this.rebuildShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    var containerBlock = workspace.newBlock('conditional_block_if');
    containerBlock.initSvg();
    var connection = containerBlock.nextConnection;
    for (var i = 1; i <= this.elseifCount_; i++) {
      var elseifBlock = workspace.newBlock('conditional_block_elseif');
      elseifBlock.initSvg();
      connection.connect(elseifBlock.previousConnection);
      connection = elseifBlock.nextConnection;
    }
    if (this.elseCount_) {
      var elseBlock = workspace.newBlock('conditional_block_else');
      elseBlock.initSvg();
      connection.connect(elseBlock.previousConnection);
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    var clauseBlock = containerBlock.nextConnection.targetBlock();
    // Count number of inputs.
    this.elseifCount_ = 0;
    this.elseCount_ = 0;
    var valueConnections = [];
    var statementConnections = [null];
    var elseStatementConnection = null;
    while (clauseBlock && !clauseBlock.isInsertionMarker()) {
      switch (clauseBlock.type) {
        case 'conditional_block_elseif':
          this.elseifCount_++;
          valueConnections.push(clauseBlock.valueConnection_);
          statementConnections.push(clauseBlock.statementConnection_);
          break;
        case 'conditional_block_else':
          this.elseCount_++;
          elseStatementConnection = clauseBlock.statementConnection_;
          break;
        default:
          throw TypeError('Unknown block type: ' + clauseBlock.type);
      }
      clauseBlock =
        clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
    // Reconnect any child blocks.
    this.reconnectChildBlocks_(
      valueConnections,
      statementConnections,
      elseStatementConnection
    );
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function (containerBlock) {
    var clauseBlock = containerBlock.nextConnection.targetBlock();
    var i = 1;
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'conditional_block_elseif':
          var inputIf = this.getField('STATEMENT' + i);
          var inputDo = this.getInput('DO' + i);
          clauseBlock.valueConnection_ = inputIf;
          clauseBlock.statementConnection_ =
            inputDo && inputDo.connection.targetConnection;
          i++;
          break;
        case 'conditional_block_else':
          var inputDo = this.getInput('ELSE');
          clauseBlock.statementConnection_ =
            inputDo && inputDo.connection.targetConnection;
          break;
        default:
          throw TypeError('Unknown block type: ' + clauseBlock.type);
      }
      clauseBlock =
        clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Reconstructs the block with all child blocks attached.
   * @this {Blockly.Block}
   */
  rebuildShape_: function () {
    var valueConnections = [];
    var statementConnections = [null];
    var elseStatementConnection = null;

    if (this.getInput('ELSE')) {
      elseStatementConnection =
        this.getInput('ELSE').connection.targetConnection;
    }
    var i = 1;
    while (this.getInput('IF' + i)) {
      var inputIf = this.getInput('IF' + i);
      var inputDo = this.getInput('DO' + i);
      valueConnections.push(inputIf);
      statementConnections.push(inputDo.connection.targetConnection);
      i++;
    }
    this.updateShape_();
    this.reconnectChildBlocks_(
      valueConnections,
      statementConnections,
      elseStatementConnection
    );
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @this {Blockly.Block}
   * @private
   */
  updateShape_: function () {
    // Delete everything.
    if (this.getInput('ELSE')) {
      this.removeInput('ELSE');
    }
    var i = 1;
    while (this.getInput('IF' + i)) {
      this.removeInput('IF' + i);
      this.removeInput('DO' + i);
      i++;
    }
    // Rebuild block.
    for (i = 1; i <= this.elseifCount_; i++) {
      this.appendDummyInput('IF' + i)
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'])
        .appendField(
          new Blockly.FieldTextInput('statement' + i),
          'STATEMENT' + i
        );
      this.appendStatementInput('DO' + i).appendField(
        Blockly.Msg['CONTROLS_IF_MSG_THEN']
      );
    }
    if (this.elseCount_) {
      this.appendStatementInput('ELSE').appendField(
        Blockly.Msg['CONTROLS_IF_MSG_ELSE']
      );
    }
  },
  /**
   * Reconnects child blocks.
   * @param {!Array<?Blockly.RenderedConnection>} valueConnections List of
   * value connections for 'if' input.
   * @param {!Array<?Blockly.RenderedConnection>} statementConnections List of
   * statement connections for 'do' input.
   * @param {?Blockly.RenderedConnection} elseStatementConnection Statement
   * connection for else input.
   * @this {Blockly.Block}
   */
  reconnectChildBlocks_: function (
    valueConnections,
    statementConnections,
    elseStatementConnection
  ) {
    for (var i = 1; i <= this.elseifCount_; i++) {
      if (valueConnections[i - 1] == undefined) {
        return;
      } else {
        this.setFieldValue(valueConnections[i - 1].value_, 'STATEMENT' + i);
      }
      Blockly.Mutator.reconnect(statementConnections[i], this, 'DO' + i);
    }
    Blockly.Mutator.reconnect(elseStatementConnection, this, 'ELSE');
  },
};

Blockly.Extensions.registerMutator(
  'conditional_block_mutator',
  Blockly.Constants.Logic.CONTROLS_IF_MUTATOR_MIXIN,
  null,
  ['conditional_block_elseif', 'conditional_block_else']
);
/**
 * "conditional_block" extension function. Adds mutator, shape updating methods, and
 * dynamic tooltip to "conditional_block" blocks.
 * @this {Blockly.Block}
 * @package
 */
Blockly.Constants.Logic.CONTROLS_IF_TOOLTIP_EXTENSION = function () {
  this.setTooltip(
    function () {
      if (!this.elseifCount_ && !this.elseCount_) {
        return Blockly.Msg['CONTROLS_IF_TOOLTIP_1'];
      } else if (!this.elseifCount_ && this.elseCount_) {
        return Blockly.Msg['CONTROLS_IF_TOOLTIP_2'];
      } else if (this.elseifCount_ && !this.elseCount_) {
        return Blockly.Msg['CONTROLS_IF_TOOLTIP_3'];
      } else if (this.elseifCount_ && this.elseCount_) {
        return Blockly.Msg['CONTROLS_IF_TOOLTIP_4'];
      }
      return '';
    }.bind(this)
  );
};

Blockly.Extensions.register(
  'conditional_block_tooltip',
  Blockly.Constants.Logic.CONTROLS_IF_TOOLTIP_EXTENSION
);
