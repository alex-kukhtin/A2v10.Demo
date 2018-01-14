/*invoice index template*/

const template = {
    properties: {
        'TDocument.$Mark': mark,
        'TDocument.$Icon'() { return this.Done ? 'success-green' : ''; }
    },
};


function mark() {
    return this.Done ? "success" : '';
}

module.exports = template;

