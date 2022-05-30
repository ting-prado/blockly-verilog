/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Procedure blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.modules');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Comment');
goog.require('Blockly.FieldCheckbox');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Mutator');
goog.require('Blockly.Warning');

Blockly.Blocks['modules_defnoreturn'] = {
  /**
   * Block for defining a module with no return value.
   * @this {Blockly.Block}
   */
  init: function () {
    var initName = Blockly.Procedures.findLegalName(
      Blockly.Msg['MODULES_DEFNORETURN_MODULE'],
      this
    );
    var nameField = new Blockly.FieldTextInput(
      initName,
      Blockly.Procedures.rename
    );
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField(Blockly.Msg['MODULES_DEFNORETURN_TITLE'])
      .appendField(nameField, 'NAME');
    this.appendDummyInput().appendField('Assigned').appendField('', 'PARAMS');
    this.appendDummyInput().appendField('Module content:');
    this.setInputsInline(false);
    this.setMutator(new Blockly.Mutator(['modules_mutatorarg']));
    if (
      (this.workspace.options.comments ||
        (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg['MODULES_DEFNORETURN_COMMENT']
    ) {
      this.setCommentText(Blockly.Msg['MODULES_DEFNORETURN_COMMENT']);
    }
    this.setStyle('procedure_blocks');
    this.setTooltip(Blockly.Msg['MODULES_DEFNORETURN_TOOLTIP']);
    this.setHelpUrl(Blockly.Msg['MODULES_DEFNORETURN_HELPURL']);
    this.arguments_ = [];
    this.types_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
    this.appendDummyInput().appendField('end module');
  },
  /**
   * Add or remove the statement block from this function definition.
   * @param {boolean} hasStatements True if a statement block is needed.
   * @this {Blockly.Block}
   */
  setStatements_: function (hasStatements) {
    if (this.hasStatements_ === hasStatements) {
      return;
    }
    if (hasStatements) {
      this.appendStatementInput('STACK').appendField(
        Blockly.Msg['PROCEDURES_DEFNORETURN_DO']
      );
      if (this.getInput('RETURN')) {
        this.moveInputBefore('STACK', 'RETURN');
      }
    } else {
      this.removeInput('STACK', true);
    }
    this.hasStatements_ = hasStatements;
  },
  /**
   * Update the display of parameters for this procedure definition block.
   * @private
   * @this {Blockly.Block}
   */
  updateParams_: function () {
    // Check for duplicated arguments.
    var badArg = false;
    var hash = {};
    for (var x = 0; x < this.arguments_.length; x++) {
      if (hash['arg_' + this.arguments_[x].toLowerCase()]) {
        badArg = true;
        break;
      }
      hash['arg_' + this.arguments_[x].toLowerCase()] = true;
    }
    if (badArg) {
      this.setWarningText(Blockly.Msg.MODULES_DEF_DUPLICATE_WARNING);
    } else {
      this.setWarningText(null);
    }
    // Merge the arguments into a human-readable list.
    let ports = [];
    for (let i = 0; i < this.arguments_.length; i++) {
      if (this.types_[i] != 'wire') {
        ports.push(this.arguments_[i]);
      }
    }

    var paramString = '';
    if (this.arguments_.length) {
      paramString =
        Blockly.Msg['MODULES_BEFORE_PARAMS'] + ' ' + ports.join(', ');
    }
    // The params field is deterministic based on the mutation,
    // no need to fire a change event.
    Blockly.Events.disable();
    try {
      this.setFieldValue(paramString, 'PARAMS');
    } finally {
      Blockly.Events.enable();
    }
  },
  /**
   * Create XML to represent the argument inputs.
   * @param {boolean=} opt_paramIds If true include the IDs of the parameter
   *     quarks.  Used by Blockly.Procedures.mutateCallers for reconnection.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function (opt_paramIds) {
    var container = Blockly.utils.xml.createElement('mutation');
    if (opt_paramIds) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      var parameter = Blockly.utils.xml.createElement('arg');
      var argModel = this.argumentVarModels_[i];
      parameter.setAttribute('name', argModel.name);
      parameter.setAttribute('types', this.types_[i]);
      parameter.setAttribute('varid', argModel.getId());
      if (opt_paramIds && this.paramIds_) {
        parameter.setAttribute('paramId', this.paramIds_[i]);
      }
      container.appendChild(parameter);
    }

    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    return container;
  },
  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    for (var i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        var varName = childNode.getAttribute('name');
        var varType = childNode.getAttribute('types');
        var varId =
          childNode.getAttribute('varid') || childNode.getAttribute('varId');
        var variable = Blockly.Variables.getOrCreateVariablePackage(
          this.workspace,
          varId,
          varName,
          varType
        );
        if (variable != null) {
          this.argumentVarModels_.push(variable);
        } else {
          console.log(
            'Failed to create a variable with name ' + varName + ', ignoring.'
          );
        }
      }
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show or hide the statement input.
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    /*
     * Creates the following XML:
     * <block type="modules_mutatorcontainer">
     *   <statement name="STACK">
     *     <block type="modules_mutatorarg">
     *       <field name="NAME">arg1_name</field>
     *       <next>etc...</next>
     *     </block>
     *   </statement>
     * </block>
     */

    var containerBlockNode = Blockly.utils.xml.createElement('block');
    containerBlockNode.setAttribute('type', 'modules_mutatorcontainer');
    var statementNode = Blockly.utils.xml.createElement('statement');
    statementNode.setAttribute('name', 'STACK');
    containerBlockNode.appendChild(statementNode);

    var node = statementNode;
    for (var i = 0; i < this.arguments_.length; i++) {
      var argBlockNode = Blockly.utils.xml.createElement('block');
      argBlockNode.setAttribute('type', 'modules_mutatorarg');
      var nameValue = Blockly.Xml.textToDom(
        `<field name="NAME">${this.arguments_[i]}</field>`
      );
      argBlockNode.appendChild(nameValue);
      var typeValue = Blockly.Xml.textToDom(
        `<field name="WIRE_PORTS">${this.types_[i]}</field>`
      );
      argBlockNode.appendChild(typeValue);
      // var fieldNode = Blockly.utils.xml.createElement('field');
      // fieldNode.setAttribute('name', 'NAME');
      // var argumentName = Blockly.utils.xml.createTextNode(this.arguments_[i]);
      // fieldNode.appendChild(argumentName);
      // argBlockNode.appendChild(fieldNode);

      // var typeNode = Blockly.utils.xml.createElement('field');
      // typeNode.setAttribute('name', 'WIRE_PORTS');
      // var typeName = Blockly.utils.xml.createTextNode(this.types_[i]);
      // typeNode.appendChild(typeName);
      // argBlockNode.appendChild(typeNode);

      var nextNode = Blockly.utils.xml.createElement('next');
      argBlockNode.appendChild(nextNode);

      node.appendChild(argBlockNode);
      node = nextNode;
    }

    var containerBlock = Blockly.Xml.domToBlock(containerBlockNode, workspace);

    if (this.type == 'modules_defreturn') {
      containerBlock.setFieldValue(this.hasStatements_, 'STATEMENTS');
    } else {
      containerBlock.removeInput('STATEMENT_INPUT');
    }

    // Initialize procedure's callers with blank IDs.
    Blockly.Procedures.mutateCallers(this);
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    // Parameter list.
    this.arguments_ = [];
    this.types_ = [];
    this.paramIds_ = [];
    this.argumentVarModels_ = [];
    var paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock && !paramBlock.isInsertionMarker()) {
      var varName = paramBlock.getFieldValue('NAME');
      this.arguments_.push(varName);
      var portVal = paramBlock.getFieldValue('WIRE_PORTS');
      this.types_.push(portVal);
      var variable = this.workspace.getVariable(varName, '');
      this.argumentVarModels_.push(variable);
      this.paramIds_.push(paramBlock.id);
      paramBlock =
        paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show/hide the statement input.
    var hasStatements = containerBlock.getFieldValue('STATEMENTS');
    if (hasStatements !== null) {
      hasStatements = hasStatements == 'TRUE';
      if (this.hasStatements_ != hasStatements) {
        if (hasStatements) {
          this.setStatements_(true);
          // Restore the stack, if one was saved.
          Blockly.Mutator.reconnect(this.statementConnection_, this, 'STACK');
          this.statementConnection_ = null;
        } else {
          // Save the stack, then disconnect it.
          var stackConnection = this.getInput('STACK').connection;
          this.statementConnection_ = stackConnection.targetConnection;
          if (this.statementConnection_) {
            var stackBlock = stackConnection.targetBlock();
            stackBlock.unplug();
            stackBlock.bumpNeighbours();
          }
          this.setStatements_(false);
        }
      }
    }
  },
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES NOT have a return value.
   * @this {Blockly.Block}
   */
  getProcedureDef: function () {
    return [
      this.getFieldValue('NAME'),
      this.getFieldValue('WIRE_PORTS'),
      this.arguments_,
      this.types_,
      false,
    ];
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array<string>} List of variable names.
   * @this {Blockly.Block}
   */
  getVars: function () {
    return this.arguments_;
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array<!Blockly.VariableModel>} List of variable models.
   * @this {Blockly.Block}
   */
  getVarModels: function () {
    return this.argumentVarModels_;
  },
  /**
   * Notification that a variable is renaming.
   * If the ID matches one of this block's variables, rename it.
   * @param {string} oldId ID of variable to rename.
   * @param {string} newId ID of new variable.  May be the same as oldId, but
   *     with an updated name.  Guaranteed to be the same type as the old
   *     variable.
   * @override
   * @this {Blockly.Block}
   */
  renameVarById: function (oldId, newId) {
    var oldVariable = this.workspace.getVariableById(oldId);
    if (oldVariable.type != '') {
      // Procedure arguments always have the empty type.
      return;
    }
    var oldName = oldVariable.name;
    var newVar = this.workspace.getVariableById(newId);

    var change = false;
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() == oldId) {
        this.arguments_[i] = newVar.name;
        this.argumentVarModels_[i] = newVar;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newVar.name);
      Blockly.Procedures.mutateCallers(this);
    }
  },
  /**
   * Notification that a variable is renaming but keeping the same ID.  If the
   * variable is in use on this block, rerender to show the new name.
   * @param {!Blockly.VariableModel} variable The variable being renamed.
   * @package
   * @override
   * @this {Blockly.Block}
   */
  updateVarName: function (variable) {
    var newName = variable.name;
    var change = false;
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() == variable.getId()) {
        var oldName = this.arguments_[i];
        this.arguments_[i] = newName;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newName);
      Blockly.Procedures.mutateCallers(this);
    }
  },
  /**
   * Update the display to reflect a newly renamed argument.
   * @param {string} oldName The old display name of the argument.
   * @param {string} newName The new display name of the argument.
   * @private
   * @this {Blockly.Block}
   */
  displayRenamedVar_: function (oldName, newName) {
    this.updateParams_();
    // Update the mutator's variables if the mutator is open.
    if (this.mutator && this.mutator.isVisible()) {
      var blocks = this.mutator.workspace_.getAllBlocks(false);
      for (var i = 0, block; (block = blocks[i]); i++) {
        if (
          block.type == 'modules_mutatorarg' &&
          Blockly.Names.equals(oldName, block.getFieldValue('NAME'))
        ) {
          block.setFieldValue(newName, 'NAME');
        }
      }
    }
  },
  /**
   * Add custom menu options to this block's context menu.
   * @param {!Array} options List of menu options to add to.
   * @this {Blockly.Block}
   */
  customContextMenu: function (options) {
    if (this.isInFlyout) {
      return;
    }
    // Add option to create caller.
    var option = { enabled: true };
    var name = this.getFieldValue('NAME');
    option.text = Blockly.Msg['PROCEDURES_CREATE_DO'].replace('%1', name);
    var xmlMutation = Blockly.utils.xml.createElement('mutation');
    xmlMutation.setAttribute('name', name);
    for (var i = 0; i < this.arguments_.length; i++) {
      var xmlArg = Blockly.utils.xml.createElement('arg');
      xmlArg.setAttribute('name', this.arguments_[i]);
      xmlMutation.appendChild(xmlArg);
    }
    var xmlBlock = Blockly.utils.xml.createElement('block');
    xmlBlock.setAttribute('type', this.callType_);
    xmlBlock.appendChild(xmlMutation);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    // if (!this.isCollapsed()) {
    //   for (var i = 0; i < this.argumentVarModels_.length; i++) {
    //     var argOption = { enabled: true };
    //     var argVar = this.argumentVarModels_[i];
    //     argOption.text = Blockly.Msg['VARIABLES_SET_CREATE_GET'].replace(
    //       '%1',
    //       argVar.name
    //     );

    //     var argXmlField = Blockly.Variables.generateVariableFieldDom(argVar);
    //     var argXmlBlock = Blockly.utils.xml.createElement('block');
    //     argXmlBlock.setAttribute('type', 'variables_get');
    //     argXmlBlock.appendChild(argXmlField);
    //     argOption.callback = Blockly.ContextMenu.callbackFactory(
    //       this,
    //       argXmlBlock
    //     );
    //     options.push(argOption);
    //   }
    // }
  },
  callType_: 'modules_callnoreturn',
  /**
   * return function's parameter information
   * return type = [type, name, scope, position, specific]
   * */
  getParamInfo: function () {
    var paramList = [];
    for (var i = 0; i < this.arguments_.length; i++) {
      paramList.push({
        type: this.types_[i],
        var_name: this.arguments_[i],
        mod_name: this.getFieldValue('NAME'),
        y_pos: this.getRelativeToSurfaceXY().y,
      });
    }
    return paramList;
  },
};

Blockly.Blocks['modules_defreturn'] = {
  /**
   * Block for defining a procedure with a return value.
   * @this {Blockly.Block}
   */
  init: function () {
    var initName = Blockly.Procedures.findLegalName('', this);
    var nameField = new Blockly.FieldTextInput(
      initName,
      Blockly.Procedures.rename
    );
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField(Blockly.Msg['PROCEDURES_DEFRETURN_TITLE'])
      .appendField(nameField, 'NAME')
      .appendField('', 'PARAMS');
    this.appendValueInput('RETURN')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField(Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']);
    this.setMutator(new Blockly.Mutator(['modules_mutatorarg']));
    if (
      (this.workspace.options.comments ||
        (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg['PROCEDURES_DEFRETURN_COMMENT']
    ) {
      this.setCommentText(Blockly.Msg['PROCEDURES_DEFRETURN_COMMENT']);
    }
    this.setStyle('procedure_blocks');
    this.setTooltip(Blockly.Msg['PROCEDURES_DEFRETURN_TOOLTIP']);
    this.setHelpUrl(Blockly.Msg['PROCEDURES_DEFRETURN_HELPURL']);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  setStatements_: Blockly.Blocks['modules_defnoreturn'].setStatements_,
  updateParams_: Blockly.Blocks['modules_defnoreturn'].updateParams_,
  mutationToDom: Blockly.Blocks['modules_defnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['modules_defnoreturn'].domToMutation,
  decompose: Blockly.Blocks['modules_defnoreturn'].decompose,
  compose: Blockly.Blocks['modules_defnoreturn'].compose,
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES have a return value.
   * @this {Blockly.Block}
   */
  getProcedureDef: function () {
    return [
      this.getFieldValue('NAME'),
      this.getFieldValue('WIRE_PORTS'),
      this.arguments_,
      this.types_,
      true,
    ];
  },
  getType: function () {
    return [this.getFieldValue('WIRE_PORTS')];
  },
  getVars: Blockly.Blocks['modules_defnoreturn'].getVars,
  getVarModels: Blockly.Blocks['modules_defnoreturn'].getVarModels,
  renameVarById: Blockly.Blocks['modules_defnoreturn'].renameVarById,
  updateVarName: Blockly.Blocks['modules_defnoreturn'].updateVarName,
  displayRenamedVar_: Blockly.Blocks['modules_defnoreturn'].displayRenamedVar_,
  customContextMenu: Blockly.Blocks['modules_defnoreturn'].customContextMenu,
  callType_: 'modules_callreturn',
};

Blockly.Blocks['modules_mutatorcontainer'] = {
  /**
   * Mutator block for procedure container.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField(
      Blockly.Msg['MODULES_MUTATORCONTAINER_TITLE']
    );
    this.appendStatementInput('STACK');
    this.appendDummyInput('STATEMENT_INPUT')
      .appendField(Blockly.Msg['PROCEDURES_ALLOW_STATEMENTS'])
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'STATEMENTS');
    this.setStyle('procedure_blocks');
    this.setTooltip(Blockly.Msg['MODULES_MUTATORCONTAINER_TOOLTIP']);
    this.contextMenu = false;
  },
};

Blockly.Blocks['modules_mutatorarg'] = {
  /**
   * Mutator block for procedure argument.
   * @this {Blockly.Block}
   */
  init: function () {
    var field = new Blockly.FieldTextInput(
      Blockly.Procedures.DEFAULT_ARG,
      this.validator_
    );
    // Hack: override showEditor to do just a little bit more work.
    // We don't have a good place to hook into the start of a text edit.
    field.oldShowEditorFn_ = field.showEditor_;
    var newShowEditorFn = function () {
      this.createdVariables_ = [];
      this.oldShowEditorFn_();
    };
    field.showEditor_ = newShowEditorFn;

    this.appendDummyInput()
      .appendField(Blockly.Msg['MODULES_MUTATORARG_TITLE'])
      .appendField(field, 'NAME')
      .appendField('as')
      .appendField(
        new Blockly.FieldDropdown([
          ['INPUT', 'input'],
          ['OUTPUT', 'output'],
          ['WIRE', 'wire'],
        ]),
        'WIRE_PORTS'
      );
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setStyle('procedure_blocks');
    this.setTooltip(Blockly.Msg['MODULES_MUTATORARG_TOOLTIP']);
    this.contextMenu = false;
    // Create the default variable when we drag the block in from the flyout.
    // Have to do this after installing the field on the block.
    field.onFinishEditing_ = this.deleteIntermediateVars_;
    // Create an empty list so onFinishEditing_ has something to look at, even
    // though the editor was never opened.
    field.createdVariables_ = [];
    field.onFinishEditing_('x');
  },

  /**
   * Obtain a valid name for the procedure argument. Create a variable if
   * necessary.
   * Merge runs of whitespace.  Strip leading and trailing whitespace.
   * Beyond this, all names are legal.
   * @param {string} varName User-supplied name.
   * @return {?string} Valid name, or null if a name was not specified.
   * @private
   * @this Blockly.FieldTextInput
   */
  validator_: function (varName) {
    var sourceBlock = this.getSourceBlock();
    var outerWs = Blockly.Mutator.findParentWs(sourceBlock.workspace);
    varName = varName.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    if (!varName) {
      return null;
    }
    // Prevents duplicate parameter names in functions
    var workspace =
      sourceBlock.workspace.targetWorkspace || sourceBlock.workspace;
    var blocks = workspace.getAllBlocks(false);
    var caselessName = varName.toLowerCase();
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].id == this.getSourceBlock().id) {
        continue;
      }
      // Other blocks values may not be set yet when this is loaded.
      var otherVar = blocks[i].getFieldValue('NAME');
      if (otherVar && otherVar.toLowerCase() == caselessName) {
        return null;
      }
    }

    // Don't create variables for arg blocks that
    // only exist in the mutator's flyout.
    if (sourceBlock.isInFlyout) {
      return varName;
    }

    var model = outerWs.getVariable(varName, '');
    if (model && model.name != varName) {
      // Rename the variable (case change)
      outerWs.renameVariableById(model.getId(), varName);
    }
    if (!model) {
      model = outerWs.createVariable(varName, '');
      if (model && this.createdVariables_) {
        this.createdVariables_.push(model);
      }
    }
    return varName;
  },

  /**
   * Called when focusing away from the text field.
   * Deletes all variables that were created as the user typed their intended
   * variable name.
   * @param {string} newText The new variable name.
   * @private
   * @this Blockly.FieldTextInput
   */
  deleteIntermediateVars_: function (newText) {
    var outerWs = Blockly.Mutator.findParentWs(this.getSourceBlock().workspace);
    if (!outerWs) {
      return;
    }
    for (var i = 0; i < this.createdVariables_.length; i++) {
      var model = this.createdVariables_[i];
      if (model.name != newText) {
        outerWs.deleteVariableById(model.getId());
      }
    }
  },
  getTypes: function () {
    return [this.getFieldValue('WIRE_PORTS')];
  },
};

Blockly.Blocks['modules_callnoreturn'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput('TOPROW')
      .appendField('', 'NAME')
      .appendField('with instance name: ')
      .appendField(new Blockly.FieldTextInput('unasigned'), 'INSTANCE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setInputsInline(true);
    this.setStyle('procedure_blocks');
    // Tooltip is set in renameProcedure.
    this.setHelpUrl(Blockly.Msg['MODULES_CALLNORETURN_HELPURL']);
    this.arguments_ = [];
    this.types_ = [];
    this.argumentVarModels_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
    this.previousEnabledState_ = true;
    this.setOnChange(function (changeEvent) {
      if (this.getParent()) {
        if (
          this.getParent().getFieldValue('NAME') == this.getFieldValue('NAME')
        ) {
          this.setWarningText('Connect this block to a different module');
        } else {
          this.setWarningText(null);
        }
      } else {
        this.setWarningText('This block should be connected to a module block');
      }
    });
  },

  /**
   * Returns the name of the procedure this block calls.
   * @return {string} Procedure name.
   * @this {Blockly.Block}
   */
  getProcedureCall: function () {
    // The NAME field is guaranteed to exist, null will never be returned.
    return /** @type {string} */ (this.getFieldValue('NAME'));
  },
  /**
   * Notification that a procedure is renaming.
   * If the name matches this block's procedure, rename it.
   * @param {string} oldName Previous name of procedure.
   * @param {string} newName Renamed procedure.
   * @this {Blockly.Block}
   */
  renameProcedure: function (oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getProcedureCall())) {
      this.setFieldValue(newName, 'NAME');
      var baseMsg = this.outputConnection
        ? Blockly.Msg['PROCEDURES_CALLRETURN_TOOLTIP']
        : Blockly.Msg['MODULES_CALLNORETURN_TOOLTIP'];
      this.setTooltip(baseMsg.replace('%1', newName));
    }
  },
  /**
   * Notification that the procedure's parameters have changed.
   * @param {!Array<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
   * @param {!Array<string>} paramIds IDs of params (consistent for each
   *     parameter through the life of a mutator, regardless of param renaming),
   *     e.g. ['piua', 'f8b_', 'oi.o'].
   * @private
   * @this {Blockly.Block}
   */
  setProcedureParameters_: function (paramNames, paramTypes, paramIds) {
    // Data structures:
    // this.arguments = ['x', 'y']
    //     Existing param names.
    // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
    //     Look-up of paramIds to connections plugged into the call block.
    // this.quarkIds_ = ['piua', 'f8b_']
    //     Existing param IDs.
    // Note that quarkConnections_ may include IDs that no longer exist, but
    // which might reappear if a param is reattached in the mutator.
    var defBlock = Blockly.Procedures.getDefinition(
      this.getProcedureCall(),
      this.workspace
    );
    let paramList = defBlock.getParamInfo();
    for (let i = 0; i < paramList.length; i++) {
      paramTypes[i] = paramList[i].type;
    }
    var mutatorOpen =
      defBlock && defBlock.mutator && defBlock.mutator.isVisible();
    if (!mutatorOpen) {
      this.quarkConnections_ = {};
      this.quarkIds_ = null;
    }
    if (!paramIds) {
      // Reset the quarks (a mutator is about to open).
      return;
    }
    // Test arguments (arrays of strings) for changes. '\n' is not a valid
    // argument name character, so it is a valid delimiter here.
    if (paramNames.join('\n') == this.arguments_.join('\n')) {
      // No change.
      this.quarkIds_ = paramIds;
      return;
    }
    if (paramIds.length != paramNames.length) {
      throw RangeError('paramNames and paramIds must be the same length.');
    }
    this.setCollapsed(false);
    if (!this.quarkIds_) {
      // Initialize tracking for this block.
      this.quarkConnections_ = {};
      this.quarkIds_ = [];
    }
    // Switch off rendering while the block is rebuilt.
    var savedRendered = this.rendered;
    this.rendered = false;
    // Update the quarkConnections_ with existing connections.
    for (var i = 0; i < this.arguments_.length; i++) {
      var input = this.getInput('ARG' + i);
      // if (input) {
      //   var connection = input.connection.targetConnection;
      //   this.quarkConnections_[this.quarkIds_[i]] = connection;
      //   if (
      //     mutatorOpen &&
      //     connection &&
      //     paramIds.indexOf(this.quarkIds_[i]) == -1
      //   ) {
      //     // This connection should no longer be attached to this block.
      //     connection.disconnect();
      //     connection.getSourceBlock().bumpNeighbours();
      //   }
      // }
    }
    // Rebuild the block's arguments.
    this.arguments_ = [].concat(paramNames);
    this.types_ = [].concat(paramTypes);
    // And rebuild the argument model list.
    this.argumentVarModels_ = [];
    for (var i = 0; i < this.arguments_.length; i++) {
      var variable = Blockly.Variables.getOrCreateVariablePackage(
        this.workspace,
        null,
        this.arguments_[i],
        this.types_[i]
      );
      this.argumentVarModels_.push(variable);
    }

    this.updateShape_();
    this.quarkIds_ = paramIds;
    // Reconnect any child blocks.
    if (this.quarkIds_) {
      for (var i = 0; i < this.arguments_.length; i++) {
        var quarkId = this.quarkIds_[i];
        if (quarkId in this.quarkConnections_) {
          var connection = this.quarkConnections_[quarkId];
          if (!Blockly.Mutator.reconnect(connection, this, 'ARG' + i)) {
            // Block no longer exists or has been attached elsewhere.
            delete this.quarkConnections_[quarkId];
          }
        }
      }
    }
    //Restore rendering and show the changes.
    this.rendered = savedRendered;
    if (this.rendered) {
      this.render();
    }
  },
  /**
   * Modify this block to have the correct number of arguments.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    let inoutarr = this.getInOut();
    for (var i = 0; i < inoutarr.length; i++) {
      var field = this.getField('ARGNAME' + i);
      if (field) {
        // Ensure argument name is up to date.
        // The argument name field is deterministic based on the mutation,
        // no need to fire a change event.
        Blockly.Events.disable();
        try {
          field.setValue(inoutarr[i].name);
        } finally {
          Blockly.Events.enable();
        }
      } else {
        // Add new input.
        field = new Blockly.FieldLabel(inoutarr[i].name + ':');
        //field = new Blockly.FieldLabel(this.arguments_[i]);
        var input = this.appendDummyInput('ARG' + i)
          .appendField(field, 'ARGNAME' + i)
          .appendField(
            new Blockly.FieldDropdown(this.generateOptions),
            'ARGD' + i
          );
        // var input = this.appendValueInput('ARG' + i)
        //   .setAlign(Blockly.ALIGN_RIGHT)
        //   .appendField(field, 'ARGNAME' + i);
        input.init();
      }
    }
    // Remove deleted inputs.
    while (this.getInput('ARG' + i)) {
      this.removeInput('ARG' + i);
      i++;
    }
    // Add 'with:' if there are parameters, remove otherwise.
    var topRow = this.getInput('TOPROW');
    if (topRow) {
      if (this.arguments_.length) {
        if (!this.getField('WITH')) {
          topRow.appendField(Blockly.Msg['MODULES_CALL_BEFORE_PARAMS'], 'WITH');
          topRow.init();
        }
      } else {
        if (this.getField('WITH')) {
          topRow.removeField('WITH');
        }
      }
    }
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('name', this.getProcedureCall());
    for (var i = 0; i < this.arguments_.length; i++) {
      var parameter = Blockly.utils.xml.createElement('arg');
      parameter.setAttribute('name', this.arguments_[i]);
      parameter.setAttribute('types', this.types_[i]);
      container.appendChild(parameter);
    }
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    var name = xmlElement.getAttribute('name');
    this.renameProcedure(this.getProcedureCall(), name);
    var args = [];
    var types = [];
    var paramIds = [];
    for (var i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        args.push(childNode.getAttribute('name'));
        types.push(childNode.getAttribute('types'));
        paramIds.push(childNode.getAttribute('paramId'));
      }
    }
    this.setProcedureParameters_(args, types, paramIds);
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array<string>} List of variable names.
   * @this {Blockly.Block}
   */
  getVars: function () {
    return this.arguments_;
  },
  getInOut: function () {
    let inoutarr = [];
    this.argumentVarModels_.forEach((data) => {
      if ((data.type == 'input') | (data.type == 'output')) {
        inoutarr.push(data);
      }
    });
    return inoutarr;
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array<!Blockly.VariableModel>} List of variable models.
   * @this {Blockly.Block}
   */
  getVarModels: function () {
    return this.argumentVarModels_;
  },
  /**
   * Procedure calls cannot exist without the corresponding procedure
   * definition.  Enforce this link whenever an event is fired.
   * @param {!Blockly.Events.Abstract} event Change event.
   * @this {Blockly.Block}
   */
  onchange: function (event) {
    if (!this.workspace || this.workspace.isFlyout) {
      // Block is deleted or is in a flyout.
      return;
    }
    if (!event.recordUndo) {
      // Events not generated by user. Skip handling.
      return;
    }
    if (
      event.type == Blockly.Events.BLOCK_CREATE &&
      event.ids.indexOf(this.id) != -1
    ) {
      // Look for the case where a procedure call was created (usually through
      // paste) and there is no matching definition.  In this case, create
      // an empty definition block with the correct signature.
      var name = this.getProcedureCall();
      var def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (
        def &&
        (def.type != this.defType_ ||
          JSON.stringify(def.getVars()) != JSON.stringify(this.arguments_))
      ) {
        // The signatures don't match.
        def = null;
      }
      if (!def) {
        Blockly.Events.setGroup(event.group);
        /**
         * Create matching definition block.
         * <xml xmlns="https://developers.google.com/blockly/xml">
         *   <block type="modules_defreturn" x="10" y="20">
         *     <mutation name="test">
         *       <arg name="x"></arg>
         *     </mutation>
         *     <field name="NAME">test</field>
         *   </block>
         * </xml>
         */
        var xml = Blockly.utils.xml.createElement('xml');
        var block = Blockly.utils.xml.createElement('block');
        block.setAttribute('type', this.defType_);
        var xy = this.getRelativeToSurfaceXY();
        var x = xy.x + Blockly.SNAP_RADIUS * (this.RTL ? -1 : 1);
        var y = xy.y + Blockly.SNAP_RADIUS * 2;
        block.setAttribute('x', x);
        block.setAttribute('y', y);
        var mutation = this.mutationToDom();
        block.appendChild(mutation);
        var field = Blockly.utils.xml.createElement('field');
        field.setAttribute('name', 'NAME');
        var callName = this.getProcedureCall();
        if (!callName) {
          // Rename if name is empty string.
          callName = Blockly.Procedures.findLegalName('', this);
          this.renameProcedure('', callName);
        }
        field.appendChild(Blockly.utils.xml.createTextNode(callName));
        block.appendChild(field);
        xml.appendChild(block);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        Blockly.Events.setGroup(false);
      }
    } else if (event.type == Blockly.Events.BLOCK_DELETE) {
      // Look for the case where a procedure definition has been deleted,
      // leaving this block (a procedure call) orphaned.  In this case, delete
      // the orphan.
      var name = this.getProcedureCall();
      var def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (!def) {
        Blockly.Events.setGroup(event.group);
        this.dispose(true);
        Blockly.Events.setGroup(false);
      }
    } else if (
      event.type == Blockly.Events.CHANGE &&
      event.element == 'disabled'
    ) {
      var name = this.getProcedureCall();
      var def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (def && def.id == event.blockId) {
        // in most cases the old group should be ''
        var oldGroup = Blockly.Events.getGroup();
        if (oldGroup) {
          // This should only be possible programmatically and may indicate a problem
          // with event grouping. If you see this message please investigate. If the
          // use ends up being valid we may need to reorder events in the undo stack.
          console.log(
            'Saw an existing group while responding to a definition change'
          );
        }
        Blockly.Events.setGroup(event.group);
        if (event.newValue) {
          this.previousEnabledState_ = this.isEnabled();
          this.setEnabled(false);
        } else {
          this.setEnabled(this.previousEnabledState_);
        }
        Blockly.Events.setGroup(oldGroup);
      }
    }
  },
  generateOptions: function () {
    let options = [['-----', 'INITIAL']];
    let block = this.getSourceBlock();
    if (block) {
      if (block.getParent()) {
        let params = block.getParent().getVars();
        for (let i = 0; i < params.length; i++) {
          options.push([params[i], params[i]]);
        }
      }
    }
    return options;
  },

  /**
   * Add menu option to find the definition block for this call.
   * @param {!Array} options List of menu options to add to.
   * @this {Blockly.Block}
   */
  customContextMenu: function (options) {
    if (!this.workspace.isMovable()) {
      // If we center on the block and the workspace isn't movable we could
      // loose blocks at the edges of the workspace.
      return;
    }

    var option = { enabled: true };
    option.text = Blockly.Msg['PROCEDURES_HIGHLIGHT_DEF'];
    var name = this.getProcedureCall();
    var workspace = this.workspace;
    option.callback = function () {
      var def = Blockly.Procedures.getDefinition(name, workspace);
      if (def) {
        workspace.centerOnBlock(def.id);
        def.select();
      }
    };
    options.push(option);
  },
  defType_: 'modules_defnoreturn',
};

Blockly.Blocks['modules_callreturn'] = {
  /**
   * Block for calling a procedure with a return value.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput('TOPROW').appendField('', 'NAME');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setInputsInline(true);
    this.setStyle('procedure_blocks');
    // Tooltip is set in domToMutation.
    this.setHelpUrl(Blockly.Msg['PROCEDURES_CALLRETURN_HELPURL']);
    this.arguments_ = [];
    this.types_ = [];
    this.argumentVarModels_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
    this.previousEnabledState_ = true;
  },

  getProcedureCall: Blockly.Blocks['modules_callnoreturn'].getProcedureCall,
  renameProcedure: Blockly.Blocks['modules_callnoreturn'].renameProcedure,
  setProcedureParameters_:
    Blockly.Blocks['modules_callnoreturn'].setProcedureParameters_,
  updateShape_: Blockly.Blocks['modules_callnoreturn'].updateShape_,
  mutationToDom: Blockly.Blocks['modules_callnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['modules_callnoreturn'].domToMutation,
  getVars: Blockly.Blocks['modules_callnoreturn'].getVars,
  getVarModels: Blockly.Blocks['modules_callnoreturn'].getVarModels,
  onchange: Blockly.Blocks['modules_callnoreturn'].onchange,
  customContextMenu: Blockly.Blocks['modules_callnoreturn'].customContextMenu,
  defType_: 'modules_defreturn',
};

Blockly.Blocks['modules_ifreturn'] = {
  /**
   * Block for conditionally returning a value from a procedure.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendValueInput('CONDITION')
      .setCheck('Boolean')
      .appendField(Blockly.Msg['CONTROLS_IF_MSG_IF']);
    this.appendValueInput('VALUE').appendField(
      Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']
    );
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setStyle('procedure_blocks');
    this.setTooltip(Blockly.Msg['PROCEDURES_IFRETURN_TOOLTIP']);
    this.setHelpUrl(Blockly.Msg['PROCEDURES_IFRETURN_HELPURL']);
    this.hasReturnValue_ = true;
  },
  /**
   * Create XML to represent whether this block has a return value.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('value', Number(this.hasReturnValue_));
    return container;
  },
  /**
   * Parse XML to restore whether this block has a return value.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    var value = xmlElement.getAttribute('value');
    this.hasReturnValue_ = value == 1;
    if (!this.hasReturnValue_) {
      this.removeInput('VALUE');
      this.appendDummyInput('VALUE').appendField(
        Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']
      );
    }
  },
  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!Blockly.Events.Abstract} _e Change event.
   * @this {Blockly.Block}
   */
  onchange: function (_e) {
    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return; // Don't change state at the start of a drag.
    }
    var legal = false;
    // Is the block nested in a procedure?
    var block = this;
    do {
      if (this.FUNCTION_TYPES.indexOf(block.type) != -1) {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      // If needed, toggle whether this block has a return value.
      if (block.type == 'modules_defnoreturn' && this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendDummyInput('VALUE').appendField(
          Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']
        );
        this.hasReturnValue_ = false;
      } else if (block.type == 'modules_defreturn' && !this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendValueInput('VALUE').appendField(
          Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']
        );
        this.hasReturnValue_ = true;
      }
      this.setWarningText(null);
      if (!this.isInFlyout) {
        this.setEnabled(true);
      }
    } else {
      this.setWarningText(Blockly.Msg['PROCEDURES_IFRETURN_WARNING']);
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setEnabled(false);
      }
    }
  },
  /**
   * List of block types that are functions and thus do not need warnings.
   * To add a new function type add this to your code:
   * Blockly.Blocks['modules_ifreturn'].FUNCTION_TYPES.push('custom_func');
   */
  FUNCTION_TYPES: ['modules_defnoreturn', 'modules_defreturn'],
};
