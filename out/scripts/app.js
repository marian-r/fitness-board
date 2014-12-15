System.registerModule("../../scripts/app.js", [], function() {
  "use strict";
  var __moduleName = "../../scripts/app.js";
  'use strict';
  var App = function App(users) {
    this.users = users;
    this.selectedUser = {};
  };
  ($traceurRuntime.createClass)(App, {
    get users() {
      return this.users;
    },
    get selectedUser() {
      return this.selectedUser;
    },
    selectUser: function(index) {
      this.selectedUser = this.users[index];
    }
  }, {});
  return {get App() {
      return App;
    }};
});
System.get("../../scripts/app.js" + '');
