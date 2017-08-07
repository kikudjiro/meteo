'use strict';

const path = require('path');
const Promise = require('bluebird');
const express = require('express');
const storage = require('./storage');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();
app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: false}));


// Widgets CRUD (w/o delete, as it's not required)
app.get('/', (req, res) => {
  storage.listWidgets()
    .then(widgets => {
      res.render('list', {widgets: widgets})
    });
});
app.get('/add', (req, res) => {
  res.render('add', {});
});
app.post('/add', (req, res) => {
  const widget = {
    regionId: req.body.regionId,
    period: req.body.period,
    layout: req.body.layout
  };
  storage.saveWidget(widget);
  res.redirect(`/edit/${widget.id}`);
});
app.get('/edit/:id', (req, res) => {
  if (!req.params.id)
    return res.status(400);
  storage.loadWidget(req.params.id)
    .then(widget => {
      if (!widget) {
        res.status(404);
      } else {
        res.render('edit', {
          widget: widget,
          generateSnippet: () => {
            return `<script type="text/javascript" src="//${req.get('host')}/meteo_widget.js?id=${widget.id}"></script>`
          }
        });
      }
    })
    .catch(() => {
      res.status(500);
    });
});
app.post('/update', (req, res) => {
  storage.saveWidget({
    id: req.body.id,
    regionId: req.body.regionId,
    period: req.body.period,
    layout: req.body.layout
  });
  res.redirect('/');
});

/**
 * Generate widget HTML
 */
app.get('/meteo_widget/:id', (req, res) => {
  if (!req.params.id)
    return res.status(400);

  storage.loadWidget(req.params.id)
    .then(widget => {
      if (!widget)
        return res.status(404);

      const nDays = +widget.period || 5; // week is 5 days because weather api provides max 5 days forecast

      let date = moment();
      let dates = [];
      for (let i = 0; i < nDays; i++) {
        dates.push(date.format('YYYY-MM-DD'));
        date = date.add(1, 'days');
      }

      const days = Promise.map(dates, date => {
        return storage.loadDay(widget.regionId, date);
      }).then(days => {
        res.render('meteo_widget_' + (widget.layout === 'h' ? 'horizontal' : 'vertical'), {
          days: days
        });
      });
    })
    .catch(() => {
      res.status(500);
    });
});

app.listen(8000);

require('./watcher').start();
