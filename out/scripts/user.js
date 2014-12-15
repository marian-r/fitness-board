System.registerModule("../../scripts/user.js", [], function() {
  "use strict";
  var __moduleName = "../../scripts/user.js";
  'use strict';
  var User = function User(ehrId, firstName, lastName, dateOfBirth, gender) {
    var medicalData = arguments[5] !== (void 0) ? arguments[5] : [];
    this.ehrId = ehrId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
    this.medicalData = medicalData;
  };
  ($traceurRuntime.createClass)(User, {addMedicalData: function(medicalData) {
      this.medicalData.push(medicalData);
    }}, {});
  return {};
});
System.get("../../scripts/user.js" + '');
