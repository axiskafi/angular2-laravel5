var assertVar = require('../../xm/assertVar');
var PackageDefinition = (function () {
    function PackageDefinition(name, definitions, manager) {
        assertVar(name, 'string', name);
        assertVar(definitions, 'array', 'definitions');
        assertVar(manager, 'string', 'manager', true);
        this.name = name;
        this.definitions = definitions || [];
        this.manager = manager || 'unknown';
    }
    return PackageDefinition;
})();
module.exports = PackageDefinition;
