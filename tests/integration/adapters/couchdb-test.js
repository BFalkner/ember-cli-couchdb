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

test('Store#find/1', function() {
  var _this = this;

  stop();
  new Ember.RSVP.Promise(function(resolve, reject) {
    _this.db.bulkDocs([
        { _id: 'post::1' },
        { _id: 'post::2' },
        { _id: 'comment::1' },
        { _id: 'comment::2' },
        { _id: 'comment::3' }
      ], function(err, resp) {
      if (err) { reject(err); }
      else { resolve(resp); }
    });
  })
  .then(function() {
    return _this.store.find('post');
  })
  .then(function(posts) {
    equal(posts.get('length'), 2, "Correct number of Records are found");
  })
  .finally(start);
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

test('Model#save (create)', function() {
  var _this = this,
      name = "Rails is omakase",
      record = Ember.run(function() {
        return _this.store.createRecord('post', { id: 1, name: name });
      });

  stop();
  Ember.run(function() { return record.save(); })
  .then(function() {
    equal(record.get("isNew"), false, "Record should be saved");
    return _this.db.get('post::1');
  })
  .then(function(doc) {
    ok(doc, "Document should exist in database");
    equal(record.get('data.rev'), doc._rev, "Revision should be set on Record data");
    equal(doc.name, name, "Data should be set");
  })
  .catch(function(err) {
    ok(false, "Error: " + err);
  }).finally(start);
});

test('Model#save (update)', function() {
  var _this = this,
      names = ["Rails is omakase",
               "Yum sushi"],
      record;

  stop();
  new Ember.RSVP.Promise(function(resolve, reject) {
    _this.db.put({ _id: 'post::1' }, function(err, resp) {
      if (err) { reject(err); }
      else { resolve(resp); }
    });
  })
  .then(function() {
    return _this.store.find('post', 1);
  })
  .then(function(r) {
    record = r;
    record.set('name', names[0]);
    return record.save();
  })
  .then(function() {
    return _this.db.get('post::1');
  })
  .then(function(doc) {
    equal(doc.name, names[0], "Record data is saved on Document");

    record.set('name', names[1]);
    return record.save();
  })
  .then(function() {
    return _this.db.get('post::1');
  })
  .then(function(doc) {
    equal(doc.name, names[1], "Revision is updated on Record");
  })
  .catch(function(err) {
    ok(false, "Error: " + err);
  })
  .finally(start);
});
