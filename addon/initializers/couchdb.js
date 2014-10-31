import { Adapter, Serializer } from 'couchdb';

export default {
  name: 'couchdb',

  initialize: function(container /*, app */) {
    container.register('serializer:-couchdb', Serializer);
    container.register('adapter:-couchdb', Adapter);
  }
};
