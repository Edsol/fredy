import fs from 'fs';
import path from 'path';

import { duringWorkingHoursOrNotSet } from '../lib/utils.js';
import { config } from '../lib/utils.js';
import * as jobStorage from '../lib/services/storage/jobStorage.js';
import * as similarityCache from '../lib/services/similarity-check/similarityCache.js';
import FredyRuntime from '../lib/FredyRuntime.js';
import { setLastJobExecution } from '../lib/services/storage/listingsStorage.js';

//if db folder does not exist, ensure to create it before loading anything else
if (!fs.existsSync('../db')) {
    fs.mkdirSync('../db');
}

const providerPath = null;
const providers = null;
const provider_loaded = null;

export class JobRunner {
    constructor() { }

    async initialize() {
        this.providerPath = './lib/provider';
        this.provider_loaded = false;
        this.providers = await this.loadProviders();

        if (this.providers.length > 0) {
            this.provider_loaded = true;
        }
    }

    run() {
        const isDuringWorkingHoursOrNotSet = duringWorkingHoursOrNotSet(config, Date.now());
        if (!isDuringWorkingHoursOrNotSet) {
            console.debug('Working hours set. Skipping as outside of working hours.');
            return;
        }

        config.lastRun = Date.now();
        jobStorage.getJobs()
            .filter((job) => job.enabled)
            .forEach((job) => {
                this.runJob(job.id);
            });
    }

    runJob(jobId, force = false) {
        const job = jobStorage.getJob(jobId);

        if (job.enabled == false) {
            console.debug('Job not enabled');
            return;
        }

        job.provider
            .forEach(async (provider) => {
                const provider_module = this.providers[provider.id];
                provider_module.init(provider, job.blacklist);
                // const provider_module = fetchedProvider.find((fp) => fp.metaInformation.id === provider.id);
                provider_module.init(provider, job.blacklist);
                await new FredyRuntime(provider_module.config, job.notificationAdapter, provider.id, job.id, similarityCache).execute();
                setLastJobExecution(job.id);
            });
    }

    /**
     *
     *
     * @return {*} 
     * @memberof JobRunner
     */
    async loadProviders() {
        return await Promise.all(
            fs.readdirSync(this.providerPath)
                .filter((file) => file.endsWith('.js'))
                .map(async (filename) => import('./provider/' + filename))
        ).then((providers) => {
            providers.forEach(element => {
                var id = element.metaInformation.id;
                providers[id] = element;
            });
            return providers;
        });
    }
}