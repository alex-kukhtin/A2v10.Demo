/*invoice template*/

const utils = require('std:utils');
const du = utils.date;

const template = {
    properties: {
        'TDocument.Sum': totalSum
    },
    validators: {
        'Document.Agent': 'Выберите покупателя'
    },
    events: {
        'Model.load': modelLoad
    }
};

module.exports = template;

function modelLoad(root) {
    if (root.Document.$isNew)
        documentCreate(root.Document);
}

function documentCreate(doc) {
    doc.Date = du.today();
    doc.Kind = 'Invoice';
}

function totalSum() {
    return 123.55;
}
