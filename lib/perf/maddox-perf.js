"use strict";

/* eslint-disable */

const Promise = require("bluebird");
const SimpleStatistics = require("simple-statistics");

const MaxPerSample = 1000;
const AcceptableZScore = 1.645;

class Stats {
  static get(samples) {
    const allTimes = [];
    const allNumPerSecond = [];

    for (let sample of samples) {
      for (let time of sample) {
        allTimes.push(time);
        allNumPerSecond.push(1.0 / time);
      }
    }

    const allTimesSd = SimpleStatistics.standardDeviation(allTimes);
    const allTimesMean = SimpleStatistics.mean(allTimes);
    const allNumPerSecondSd = SimpleStatistics.standardDeviation(allNumPerSecond);
    const allNumPerSecondMean = SimpleStatistics.mean(allNumPerSecond);

    const allTimesLow = allTimesMean - (AcceptableZScore * allTimesSd);
    const allTimesHigh = allTimesMean + (AcceptableZScore * allTimesSd);
    const allNumPerSecondLow = allNumPerSecondMean - (AcceptableZScore * allNumPerSecondSd);
    const allNumPerSecondHigh = allNumPerSecondMean + (AcceptableZScore * allNumPerSecondSd);

    const allTimesAcceptable = [];
    const allNumPerSecondAcceptable = [];

    let droppedAllTimesCount = 0;
    let droppedNumPerSecondCount = 0;

    for (let i = 0; i < allTimes.length; i++) {
      if (allTimes[i] > allTimesLow && allTimes[i] < allTimesHigh) {
        allTimesAcceptable.push(allTimes[i]);
      } else {
        droppedAllTimesCount++;
      }
      if (allNumPerSecond[i] > allNumPerSecondLow && allNumPerSecond[i] < allNumPerSecondHigh) {
        allNumPerSecondAcceptable.push(allTimes[i]);
      } else {
        droppedNumPerSecondCount++;
      }
    }

    const stats = {
      date: new Date(),
      time: {
        mean: SimpleStatistics.mean(allTimes),
        median: SimpleStatistics.median(allTimes),
        standardDeviation: SimpleStatistics.standardDeviation(allTimes),
        variance: SimpleStatistics.variance(allTimes),
        dropped: droppedAllTimesCount
      },
      numPerSecond: {
        mean: SimpleStatistics.mean(allNumPerSecond),
        median: SimpleStatistics.median(allNumPerSecond),
        standardDeviation: SimpleStatistics.standardDeviation(allNumPerSecond),
        variance: SimpleStatistics.variance(allNumPerSecond),
        dropped: droppedNumPerSecondCount
      },
      totalSampleSize: allTimes.length
    };

    stats.time.standardError = Math.floor((1000 * (stats.time.standardDeviation / Math.sqrt(stats.totalSampleSize)) / stats.time.mean) / 10);
    stats.numPerSecond.standardError = Math.floor((1000 * (stats.numPerSecond.standardDeviation / Math.sqrt(stats.totalSampleSize)) / stats.numPerSecond.mean) / 10);

    return stats;
  }
}

class PerfTest {
  constructor(context) {
    this.context = context;
  }

  runSynchronously() {
    return new Promise((resolve) => {
      const samplesDone = (samples) => {
        resolve(Stats.get(samples));
      };

      Samples.new(this.context, samplesDone).run();
    });
  }
}

class Samples {
  constructor(context, samplesDone) {
    this.context = context;
    this.samplesDone = samplesDone;
    this.totalSamples = 0;
    this.samples = [];
  }

  sampleDone(stats) {
    this.totalSamples++;
    this.samples.push(stats);

    if (this.totalSamples === this.context.numSamples) {
      this.samplesDone(this.samples);
    } else {
      this.run();
    }
  }

  run() {
    process.nextTick(() => {
      Sample.new(this.context, this.sampleDone.bind(this)).run();
    });
  }

  static new(context, samplesDone) {return new Samples(context, samplesDone);}
}

class Sample {
  constructor(context, sampleDone) {
    this.context = context;
    this.sampleDone = sampleDone;

    this.timerCompleted = false;
    this.stats = [];
  }

  runOne() {
    process.nextTick(() => {
      const startTime = process.hrtime();

      this.context.runnable(() => {
        const diff = process.hrtime(startTime);
        this.stats.push((diff[0] * 1e9 + diff[1]) / 1000000000);

        if (this.timerCompleted || this.stats.length - 1 === MaxPerSample) {
          this.sampleDone(this.stats);
        } else {
          this.runOne();
        }
      });
    }, 1);
  }

  run() {
    setTimeout(() => {
      this.timerCompleted = true;
    }, this.context.sampleTime);

    this.runOne();
  }

  static new(context, sampleDone) {return new Sample(context, sampleDone);}

}

module.exports = {
  newPerfTest: (context) => {
    return new PerfTest(context);
  }
};