/**
 * edit customer
 */


const template = {
    events: {
        "Model.load": modelLoad
    },
    validators: {
        "Agent.Name": 'Введите наименование',
        "Agent.Code":
        { valid: duplicateCode, async: true, msg: "Контрагент с таким кодом ОКПО уже существует" }
    }
};

function modelLoad(root, caller) {
    const ag = root.Agent;
    if (ag.$isNew)
        customerCreate(ag);
}

function customerCreate(ag) {
    ag.Kind = 'Customer';
}

function duplicateCode(agent, code) {
    var vm = agent.$vm;
    if (!agent.Code)
        return true;
    return vm.$asyncValid('duplicateCode', { Code: agent.Code, Id: agent.Id });
}

module.exports = template;