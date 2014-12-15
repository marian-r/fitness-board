'use strict';

import { User } from './user';
import { visualize, visualizeCustom } from './chart';
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

                $('#userName').html(user.firstName + ' ' + user.lastName);

                user.loadMedicalData({
                    weightsCallback: function (user) {
                        visualizeWeights(user);
                    },
                    pulsesCallback: function (user) {
                        visualizePulse(user);
                    },
                    temperaturesCallback: function (user) {
                        visualizeTemperature(user);
                    },
                    pulseTemperaturesCallback: function (user) {
                        visualizePulseTemperature(user);
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
    visualize(user.weights, '#chartWeight', 'Weight', 'Kg');
}

function visualizePulse(user) {
    visualize(user.pulses, '#chartPulse', 'Pulse', '/min');
}

function visualizeTemperature(user) {
    visualize(user.temperatures, '#chartTemperature', 'Temperature', '°C');
}

function visualizePulseTemperature(user) {
    visualizeCustom(user.pulseTemperatures, '#chartPulseTemperatures', 'temperature', 'pulse', 'Pulse', '/min');
}

