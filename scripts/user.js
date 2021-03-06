'use strict';

import { createMedicalData, loadWeights, loadPulses, loadTemperatures, loadPulseTemperatures } from './ehr';

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
        this.pulseTemperatures = [];
    }


    loadMedicalData({
        weightsCallback = false,
        pulsesCallback = false,
        temperaturesCallback = false,
        pulseTemperaturesCallback = false
    }) {

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

        if (pulseTemperaturesCallback) {
            loadPulseTemperatures(this.ehrId, (data) => {
                this.pulseTemperatures = data;
                pulseTemperaturesCallback(this);
            })
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
