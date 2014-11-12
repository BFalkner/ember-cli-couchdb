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
    this.db.destroy();
    Ember.run(App, 'destroy');
  }
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
    }).catch(function() {
      ok(false, "Should be successful");
    }).finally(function() { start(); });
  });
});
