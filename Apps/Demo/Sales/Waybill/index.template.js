/*invoice index template*/

const utils = require('std:utils');
const du = utils.date;

const template = {
    properties: {
        'TDocument.$Mark': mark,
        'TDocument.$Icon'() { return this.Done ? 'flag-green' : ''; },
        "TDocument.$HasParent"() { return this.ParentDoc.Id !== 0; },
        "TDocParent.$Name": parentName
    },
};


function mark() {
    return this.Done ? "success" : '';
}

function parentName() {
    const doc = this;
    return `№ ${doc.No} от ${du.formatDate(doc.Date)}, ${utils.format(doc.Sum, 'Currency')} грн.`;
}

module.exports = template;

