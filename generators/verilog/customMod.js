const customMod = (() => {
  const modules = [];

  const addModule = (mod) => {
    let isDup = checkModuleDuplicates(mod.id);
    isDup === false ? modules.push(mod) : (modules[isDup].name = mod.name);
  };

  const checkModuleDuplicates = (id) => {
    let index = false;
    if (modules.length > 0) {
      modules.forEach((mod) => {
        if (mod.id === id) {
          index = modules.indexOf(mod);
        }
      });
    }
    return index;
  };

  const getFirstMod = () => modules[0].id;

  const ports = {
    input: [],
    output: [],
    wire: [],
  };

  const getModIndex = (id) => {
    let index;
    modules.forEach((mod) => {
      if (mod.id == id) {
        index = modules.indexOf(mod);
      }
    });
    return index;
  };

  const checkPortDuplicates = (modIndex, id) => {
    let index = '';
    let obj = modules[modIndex].ports;
    for (const types in obj) {
      if (obj[types].length > 0) {
        obj[types].forEach((data) => {
          if (data.id === id) {
            index = {
              type: types,
              index: obj[types].indexOf(data),
              modIndex: modIndex,
            };
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

  const removeDup = (modIndex, type, index) => {
    modules[modIndex].ports[type].splice(index, 1);
  };

  const addVariable = (modId, name, id, type) => {
    const modIndex = getModIndex(modId);
    let isDup = checkPortDuplicates(modIndex, id);
    if (isDup === '') {
      modules[modIndex].ports[type].push({ name, id });
    } else {
      if (isDup.type !== type) {
        removeDup(modIndex, isDup.type, isDup.index);
        modules[modIndex].ports[type].push({ name, id });
      } else {
        modules[modIndex].ports[isDup.type][isDup.index].name = name;
      }
    }
  };

  const orgInputs = (index) => {
    let inputs = '';
    if (modules[index].ports['input'].length > 0) {
      inputs = 'input';
      for (let i = 0; i < modules[index].ports['input'].length; i++) {
        inputs =
          inputs +
          ' ' +
          modules[index].ports['input'][i].name +
          (i !== modules[index].ports['input'].length - 1 ? ',' : '');
      }
    }
    return inputs;
  };

  const orgOutputs = (index) => {
    let outputs = '';
    if (modules[index].ports['output'].length > 0) {
      outputs = 'output';
      for (let i = 0; i < modules[index].ports['output'].length; i++) {
        outputs =
          outputs +
          ' ' +
          modules[index].ports['output'][i].name +
          (i !== modules[index].ports['output'].length - 1 ? ',' : '');
      }
    }
    return outputs;
  };

  const orgWires = (index) => {
    let wires = '';
    if (modules[index].ports['wire'].length > 0) {
      wires = 'wire';
      for (let i = 0; i < modules[index].ports['wire'].length; i++) {
        wires =
          wires +
          ' ' +
          modules[index].ports['wire'][i].name +
          (i !== modules[index].ports['wire'].length - 1 ? ',' : '');
      }
    }
    return wires;
  };

  const getPorts = (modId) => {
    let index = getModIndex(modId);
    return (
      orgInputs(index) +
      (modules[index].ports['input'].length > 0 &&
      modules[index].ports['output'].length > 0
        ? ', ' + '</br>'
        : ' ') +
      orgOutputs(index) +
      ((modules[index].ports['input'].length > 0 ||
        modules[index].ports['output'].length > 0) &&
      modules[index].ports['wire'].length > 0
        ? ', ' + '</br>'
        : ' ') +
      orgWires(index)
    );
  };

  return { addVariable, checkDeleted, getPorts, addModule, getFirstMod };
})();

const Module = (name, id) => {
  return {
    name,
    id,
    ports: {
      input: [],
      output: [],
      wire: [],
    },
  };
};
