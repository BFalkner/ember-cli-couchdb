import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('CouchDB Adapter', {
  setup: function() {
    App = startApp();
    this.store = App.__container__.lookup('store:main');
    this.db = this.store.adapterFor({ typeKey: 'post' }).get('db');
  },
  teardown: function() {
    stop();
    this.db.destroy(start);
    Ember.run(App, 'destroy');
  }
});

test('Store#find/2', function() {
  var _this = this,
      name = "Rails is omakase";

  stop();
  new Ember.RSVP.Promise(function(resolve, reject) {
    _this.db.put({ _id: 'post::1', name: name }, function(err, resp) {
      if (err) { reject(err); }
      else { resolve(resp); }
    });
  })
  .then(function() {
    return _this.store.find('post', 1);
  })
  .then(function(record) {
    equal(record.get('id'), 1, "Record ID is correct");
    equal(record.get('name'), name, "Record data is correct");
  })
  .catch(function(err) {
    ok(false, "Error: " + err);
  })
  .finally(start);
});

test('Model#save', function() {
  var _this = this,
      record = Ember.run(function() {
        return _this.store.createRecord('post', { id: 1, name: "Rails is omakase" });
      });

  stop();
  Ember.run(function() {
    record.save().then(function() {
      equal(record.get("isNew"), false, "Record should be saved");
      return _this.db.get('post::1').then(function(doc) {
        ok(doc, "Document should exist in database");
        equal(record.get('data.rev'), doc._rev, "Revision should be set on Record data");
        equal(doc.name, "Rails is omakase", "Data should be set");
      }, function(err) {
        ok(false, "Document should exist in database, message: " + err.message);
      });
    }).catch(function(err) {
      ok(false, "Error: " + err);
    }).finally(start);
  });
});
