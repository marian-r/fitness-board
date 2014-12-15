'use strict';

import { createMedicalData, loadWeights, loadPulses, loadTemperatures } from './ehr';

export class User {
    constructor({ ehrId, firstNames, lastNames, gender, dateOfBirth, medicalData = [] }) {
        this.ehrId = ehrId;
        this.firstName = firstNames;
        this.lastName = lastNames;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.weights = [];
        this.pulses = [];
        this.temperatures = [];
    }


    loadMedicalData({ weightsCallback = false, pulsesCallback = false, temperaturesCallback = false }) {

        if (weightsCallback) {
            loadWeights(this.ehrId, (weights) => {
                this.weights = weights;
                weightsCallback(this);
            });
        }

        if (pulsesCallback) {
            loadPulses(this.ehrId, (pulses) => {
                this.pulses = pulses;
                pulsesCallback(this);
            });
        }

        if (temperaturesCallback) {
            loadTemperatures(this.ehrId, (temperatures) => {
                this.temperatures = temperatures;
                temperaturesCallback(this);
            });
        }
    }


    addMedicalData({ dateTime, bodyWeight, pulse, bodyTemperature }) {

        if (bodyWeight) {
            this.weights.push({ dateTime, value: bodyWeight });
        }

        if (pulse) {
            this.pulses.push({ dateTime, value: pulse });
        }

        if (bodyTemperature) {
            this.temperatures.push({ dateTime, value: bodyTemperature });
        }

        createMedicalData(this.ehrId, { dateTime, bodyWeight, pulse, bodyTemperature });
    }
}
