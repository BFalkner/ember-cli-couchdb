import Ember from 'ember';
import DS from 'ember-data';
/* global PouchDB */

var get = Ember.get, set = Ember.set;

export default DS.Adapter.extend({
  defaultSerializer: '-couchdb',

  init: function() {
    var host = get(this, "host"),
        db = new PouchDB(host);

    set(this, "db", db);
  },

  /**
    @property host
    @type {String}
  */
  host: Ember.required(String),

  find: function(store, type, id) {
    var serializer = store.serializerFor(type.typeKey),
        _id = serializer.collate([ type.typeKey, id ]),
        db = get(this, "db");

    return new Ember.RSVP.Promise(function(resolve, reject) {
      db.get(_id, function(err, doc) {
        if (err) {
          Ember.run(null, reject, err);
          return;
        }

        Ember.run(null, resolve, doc);
      });
    });
  },

  findAll: function(store, type /* , sinceToken */) {
    var serializer = store.serializerFor(type.typeKey),
        startKey = serializer.collate([type.typeKey, '']),
        endKey = serializer.collate([type.typeKey, "\ufff0"]),
        db = get(this, 'db');

    return new Ember.RSVP.Promise(function(resolve, reject) {
      db.allDocs({
        startkey: startKey,
        endkey: endKey,
        include_docs: true
      }, function(err, resp) {
        if (err) {
          Ember.run(null, reject, err);
          return;
        }

        var docs = resp.rows.map(function(row) { return row.doc; });

        Ember.run(null, resolve, docs);
      });
    });
  },

  findQuery: function(/* store, type, query */) {},

  createRecord: function(store, type, record) {
    var serializer = store.serializerFor(type.typeKey),
        json = serializer.serialize(record, { includeId: true }),
        db = get(this, "db");

    return new Ember.RSVP.Promise(function(resolve, reject) {
      db.put(json, function(err, doc) {
        if (err) {
          Ember.run(null, reject, err);
          return;
        }

        Ember.run(function() {
          var extracted = serializer.extractCreateRecord(store, type, doc);

          store.update(type.typeKey, extracted);

          return resolve();
        });
      });
    });
  },

  updateRecord: function(store, type, record) {
    var serializer = store.serializerFor(type.typeKey),
        json = serializer.serialize(record, { includeId: true, includeRev: true }),
        db = get(this, "db");

    return new Ember.RSVP.Promise(function(resolve, reject) {
      db.put(json, function(err, doc) {
        if (err) {
          Ember.run(null, reject, err);
          return;
        }

        Ember.run(function() {
          var extracted = serializer.extractUpdateRecord(store, type, doc);

          store.update(type.typeKey, extracted);

          resolve();
        });
      });
    });
  },

  deleteRecord: function(store, type, record) {
    var serializer = store.serializerFor(type.typeKey),
        json = serializer.serialize(record, { includeId: true, includeRev: true }),
        db = get(this, "db");

    return new Ember.RSVP.Promise(function(resolve, reject) {
      db.remove(json._id,
                json._rev,
                function(err, doc) {
        if (err) {
          Ember.run(null, reject, err);
          return;
        }

        Ember.run(null, resolve, doc);
      });
    });
  }
  
});
