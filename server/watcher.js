'use strict';

const Promise = require('bluebird');
const rp = require('request-promise');
const storage = require('./storage');

const API_KEY = 'e42359c2d3fd787b75197c9f28869652';
const REGIONS = [
  {id: 'msk', apiId: 524901},
  {id: 'sp', apiId: 498817},
  {id: 'nn', apiId: 520555}
];

const RELOAD_PERIOD = 1000 * 60 * 60; // an hour

const load = () => {
  return Promise.map(REGIONS, region => {
    const url = `http://api.openweathermap.org/data/2.5/forecast?id=${region.apiId}&APPID=${API_KEY}`;
    return rp({uri: url, json: true})
      .then(data => {
        if (!data || !data.list)
          return;
        let lastDate;
        data.list.forEach(item => {
          const date = item.dt_txt.substring(0, 10);
          if (date === lastDate)
            return;
          lastDate = date;
          storage.saveDay(region.id, date, item);
        });
      })
      .catch(console.warn);
  }, {concurrency: 1});
};

const loadAndScheduleReload = () => {
  return load()
    .catch(console.warn)
    .then(() => {
      setTimeout(loadAndScheduleReload, RELOAD_PERIOD);
    });
};

let started = false;

module.exports = {
  start: () => {
    if (started)
      return;
    started = true;
    loadAndScheduleReload();
  }
};
