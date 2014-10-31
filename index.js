'use strict';

module.exports = {
  name: 'couchdb',

  included: function(app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '/pouchdb/dist/pouchdb.js');
  }
};
