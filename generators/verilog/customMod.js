const customMod = (() => {
  const ports = {
    input: [
      { name: 'input1', id: 'id1' },
      { name: 'input2', id: 'id2' },
    ],
    output: [
      { name: 'output1', id: 'id3' },
      { name: 'output2', id: 'id4' },
    ],
    wire: [
      { name: 'wire1', id: 'id5' },
      { name: 'wire2', id: 'id6' },
    ],
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

  return { addVariable, checkDeleted };
})();
