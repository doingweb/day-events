Day Events
==========

Event emitter for daily events like sunrise, sunset, dawn, dusk, etc.

Usage
-----

`DayEvents` is an `EventEmitter` that will emit events as they happen during the day, in real time. The events [come from the SunCalc library](https://github.com/mourner/suncalc#sunlight-times) and documented constants are included.

```js
const {
  DayEvents,
  eventNames: { SUNRISE, SUNSET }
} = require('day-events');

let latitude = 45.5231;
let longitude = -122.6765;

let today = new DayEvents(latitude, longitude);

today.on(SUNRISE, () => console.log('Good morning!'));
today.on(SUNSET, () => console.log('Good evening!'));

let eventTimes = today.getTimes();
console.log(`Sunset is at ${eventTimes[SUNSET].toString()}`);
```
