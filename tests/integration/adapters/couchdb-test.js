import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('CouchDB Adapter', {
  setup: function() {
    App = startApp();
    this.store = App.__container__.lookup('store:main');
  },
  teardown: function() {
    this.store.adapterFor({ typeKey: 'post' }).get('db').destroy();
    Ember.run(App, 'destroy');
  }
});

test('Model#save', function() {
  var _this = this,
      record = Ember.run(function() {
        return _this.store.createRecord('post', {id: 1});
      });

  stop();
  Ember.run(function() {
    record.save().then(function() {
      equal(record.get("isNew"), false, "Record should be saved.");
    }, function() {
      ok(false, "Should be successful.");
    }).finally(function() { start(); });
  });

});
