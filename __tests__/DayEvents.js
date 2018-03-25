const timekeeper = require('timekeeper');

let DayEvents, mockSuncalc, mockNodeSchedule;

beforeAll(() => {
  mockSuncalc = {
    getTimes: jest.fn()
  };
  jest.mock('suncalc', () => mockSuncalc);

  mockNodeSchedule = {
    scheduleJob: jest.fn()
  };
  jest.mock('node-schedule', () => mockNodeSchedule);

  DayEvents = require('../DayEvents');
});

beforeEach(() => {
  mockSuncalc.getTimes.mockReset();
  mockNodeSchedule.scheduleJob.mockReset();
});

afterEach(() => {
  timekeeper.reset();
});

describe('when constructing', () => {
  it('should set latitude and longitude', () => {
    let result = new DayEvents('expected latitude', 'expected longitude');

    expect(result.latitude).toEqual('expected latitude');
    expect(result.longitude).toEqual('expected longitude');
  });
});

it("should get times from SunCalc for today's noon", () => {
  timekeeper.freeze(new Date(2000, 0, 0, 0, 0, 0, 0));
  let expected = {};

  mockSuncalc.getTimes.mockImplementation((date, lat, long) => {
    if (
      date.getTime() === new Date(2000, 0, 0, 12, 0, 0, 0).getTime() &&
      lat === 'expected lat' &&
      long === 'expected long'
    ) {
      return expected;
    }
  });

  let events = new DayEvents('expected lat', 'expected long');

  let result = events.getTimes();

  expect(result).toBe(expected);
});

it('should emit events for SunCalc times', async () => {
  mockSuncalc.getTimes.mockReturnValue({
    first: 'time 1',
    second: 'time 2'
  });

  let events = new DayEvents();

  let listeners = ['first', 'second'].map(
    name => new Promise(resolve => events.addListener(name, resolve))
  );

  let calls = mockNodeSchedule.scheduleJob.mock.calls;
  expect(calls[0][0]).toBe('day-events-emitter-first');
  expect(calls[0][1]).toBe('time 1');
  calls[0][2]();
  expect(calls[1][0]).toBe('day-events-emitter-second');
  expect(calls[1][1]).toBe('time 2');
  calls[1][2]();

  await Promise.all(listeners);
});

it('should emit events across day boundaries', async () => {
  mockSuncalc.getTimes.mockReturnValueOnce({
    first: 'time 1'
  });
  mockSuncalc.getTimes.mockReturnValueOnce({
    second: 'time 2'
  });

  let events = new DayEvents();
  let listeners = ['first', 'second'].map(
    name => new Promise(resolve => events.addListener(name, resolve))
  );

  let calls = mockNodeSchedule.scheduleJob.mock.calls;
  expect(calls[0][0]).toBe('day-events-emitter-first');
  expect(calls[0][1]).toBe('time 1');
  calls[0][2]();
  expect(calls[1][0]).toBe('day-events-scheduleEventJobs');
  expect(calls[1][1]).toBe('0 0 0 * * *');
  calls[1][2]();
  expect(calls[2][0]).toBe('day-events-emitter-second');
  expect(calls[2][1]).toBe('time 2');
  calls[2][2]();

  await Promise.all(listeners);
});
