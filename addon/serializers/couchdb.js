import Ember from 'ember';
import DS from 'ember-data';

var get = Ember.get;

export default DS.JSONSerializer.extend({
  primaryKey: "_id",
  keyDelimiter: "::",

  collate: function(array) {
    return array.join(get(this, "keyDelimiter"));
  },

  decollate: function(string) {
    return string.split(get(this, "keyDelimiter"));
  },

  normalize: function(type, hash) {
    hash = this._super.apply(this, arguments);

    if (hash.id) {
      hash.id = this.decollate(hash.id)[1];
    }

    this.normalizeRev(hash);

    return hash;
  },

  normalizeRev: function(hash) {
    hash.rev = hash._rev;
    delete hash._rev;
  },

  serialize: function(record, options) {
    var json = this._super.apply(this, arguments),
        type = record.constructor;

    if (options.includeId) {
      json._id = this.collate([ type.typeKey, json._id ]);
    }

    if (options.includeRev) {
      json._rev = get(record, "data.rev");
    }

    return json;
  },

  extractSave: function(store, type, payload) {
    payload.id = this.decollate(payload.id)[1];

    delete payload.ok;

    return payload;
  }
});
