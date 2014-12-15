'use strict';

import { User } from './user';
import { visualize } from './chart';
import { loadPatient } from './ehr';

export class App {

    constructor() {
        this.users = {};
        this.selectedUser = {};
    }

    selectUser(ehrId) {
        if (!this.users[ehrId]) {

            loadPatient(ehrId, (data) => {
                data.ehrId = ehrId;
                var user = new User(data);
                this.users[ehrId] = user;
                this.selectedUser = user;

                this.renderUser();

                user.loadMedicalData({
                    weightsCallback: function (user) {
                        visualize(user.weights, "bodyWeight");
                    }
                });
            });

        } else {

            this.selectedUser = this.users[ehrId];
            this.renderUser();
        }
    }

    renderUser() {
        var user = this.selectedUser;
        $('#userName').html(user.firstName + ' ' + user.lastName);
        visualize(user.weights, "bodyWeight");
    }
}
