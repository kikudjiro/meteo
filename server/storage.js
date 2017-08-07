'use strict';

const Redis = require('ioredis');
const redis = new Redis();
const shortid = require('shortid');

module.exports = {
  saveDay: (regionId, date, data) => {
    // save data for 48 hours
    redis.set(`meteo:${regionId}:${date}`, JSON.stringify(data), 'EX', 48 * 60 * 60);
  },
  loadDay: (regionId, date) => {
    return redis.get(`meteo:${regionId}:${date}`)
      .then(json => JSON.parse(json));
  },

  listWidgets: () => {
    return redis.keys('widget:*');
  },
  loadWidget: id => {
    return redis.get(`widget:${id}`)
      .then(json => JSON.parse(json));
  },
  saveWidget: widget => {
    if (!widget.id) {
      widget.id = shortid.generate();
    }
    redis.set(`widget:${widget.id}`, JSON.stringify(widget));
  }
};
