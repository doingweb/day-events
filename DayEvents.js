const EventEmitter = require('events');
const { scheduleJob } = require('node-schedule');
const suncalc = require('suncalc');

class DayEvents extends EventEmitter {
  constructor(latitude, longitude) {
    super();

    this.latitude = latitude;
    this.longitude = longitude;

    this._scheduleTodaysEvents();
    scheduleJob(
      getJobName('scheduleEventJobs'),
      '0 0 0 * * *',
      this._scheduleTodaysEvents.bind(this)
    );
  }

  /**
   * Get today's day event times.
   *
   * @returns {Object} The day events, mapping event names to times.
   */
  getTimes() {
    // Use today's noon, since just after midnight may still return yesterday's dates.
    // See https://github.com/mourner/suncalc/issues/11
    let noon = new Date();
    noon.setHours(12, 0, 0, 0);
    return suncalc.getTimes(noon, this.latitude, this.longitude);
  }

  _scheduleTodaysEvents() {
    let eventTimes = this.getTimes();

    for (let eventName in eventTimes) {
      scheduleJob(getEventJobName(eventName), eventTimes[eventName], () => {
        this.emit(eventName);
      });
    }
  }
}

module.exports = DayEvents;

function getEventJobName(eventName) {
  return getJobName('emitter-' + eventName);
}

function getJobName(name) {
  return 'day-events-' + name;
}
