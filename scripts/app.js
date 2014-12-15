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

                console.log(user);

                this.renderUser();

                user.loadMedicalData({
                    weightsCallback: function (user) {
                        visualizeWeights(user);
                    },
                    pulsesCallback: function (user) {
                        visualizePulse(user);
                    },
                    temperaturesCallback: function (user) {
                        visualizeTemperature(user);
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
        visualizeWeights(user);
        visualizePulse(user);
        visualizeTemperature(user);
    }
}

function visualizeWeights(user) {
    visualize(user.weights, 'bodyWeight', '#chartWeight', 'Weight', 'Kg');
}

function visualizePulse(user) {
    visualize(user.pulses, 'pulse', '#chartPulse', 'Pulse', '/min');
}

function visualizeTemperature(user) {
    visualize(user.temperatures, 'bodyTemperature', '#chartTemperature', 'Temperature', '°C');
}
