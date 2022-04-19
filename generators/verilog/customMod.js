const customMod = (() => {
  const ports = {
    input: [],
    output: [],
    wire: [],
  };

  const checkDuplicates = (id) => {
    let index = '';
    for (const types in ports) {
      if (ports[types].length > 0) {
        ports[types].forEach((data) => {
          if (data.id === id) {
            index = { type: types, index: ports[types].indexOf(data) };
          }
        });
      }
    }
    return index;
  };

  const checkDeleted = () => {
    for (const types in ports) {
      if (ports[types].length > 0) {
        ports[types].forEach((data) => {
          if (!Object.keys(Blockly.mainWorkspace.blockDB_).includes(data.id)) {
            ports[types].splice(ports[types].indexOf(data), 1);
          }
        });
      }
    }
  };

  const removeDup = (type, index) => {
    ports[type].splice(index, 1);
  };

  const addVariable = (name, id, type) => {
    let isDup = checkDuplicates(id);
    if (isDup === '') {
      ports[type].push({ name, id });
    } else {
      if (isDup.type !== type) {
        removeDup(isDup.type, isDup.index);
        ports[type].push({ name, id });
      } else {
        ports[isDup.type][isDup.index].name = name;
      }
    }
  };

  const orgInputs = () => {
    let inputs = '';
    if (ports['input'].length > 0) {
      inputs = 'input';
      for (let i = 0; i < ports['input'].length; i++) {
        if (i !== ports['input'].length - 1) {
          inputs = inputs + ' ' + ports['input'][i].name + ',';
        } else {
          inputs = inputs + ' ' + ports['input'][i].name;
        }
      }
    }
    return inputs;
  };

  const orgOutputs = () => {
    let outputs = '';
    if (ports['output'].length > 0) {
      outputs = 'output';
      for (let i = 0; i < ports['output'].length; i++) {
        if (i !== ports['output'].length - 1) {
          outputs = outputs + ' ' + ports['output'][i].name + ',';
        } else {
          outputs = outputs + ' ' + ports['output'][i].name;
        }
      }
    }
    return outputs;
  };

  const orgWires = () => {
    let wires = '';
    if (ports['wire'].length > 0) {
      wires = 'wire';
      for (let i = 0; i < ports['wire'].length; i++) {
        if (i !== ports['wire'].length - 1) {
          wires = wires + ' ' + ports['wire'][i].name + ',';
        } else {
          wires = wires + ' ' + ports['wire'][i].name;
        }
      }
    }
    return wires;
  };

  const getPorts = () => {
    return orgInputs() + orgOutputs() + orgWires();
  };

  return { addVariable, checkDeleted, getPorts };
})();
