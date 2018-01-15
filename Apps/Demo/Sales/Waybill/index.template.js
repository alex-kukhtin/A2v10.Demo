/*invoice index template*/

const utils = require('std:utils');
const du = utils.date;

const template = {
    properties: {
        'TDocument.$Mark': mark,
        'TDocument.$Icon'() { return this.Done ? 'success-green' : ''; },
        "TDocument.$HasParent"() { return this.Parent.Id !== 0; },
        "TDocument.$ParentName": parentName,
        //"TParentDoc.$Name" - TODO: так не работает. Почему ???
    },
};


function mark() {
    return this.Done ? "success" : '';
}

function parentName() {
    const doc = this.Parent;
    return `№ ${doc.No} от ${du.formatDate(doc.Date)}, ${utils.format(doc.Sum, 'Currency')} грн.`;
}

module.exports = template;

