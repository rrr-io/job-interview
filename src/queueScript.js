export const QUEUE_SIZE = 48213;

// Each step: people ahead, estimated wait, how long it stays on screen (ms).
// Optional: toast message, or a fake disconnection.
export const TIMELINE = [
  { ahead: 48213, wait: "More than an hour", ms: 1500 },
  { ahead: 47980, wait: "More than an hour", ms: 900 },
  { ahead: 41207, wait: "About 45 minutes", ms: 1100 },
  { ahead: 41207, wait: "About 45 minutes", ms: 1600 },
  { ahead: 51002, wait: "About 3 hours", ms: 2000, toast: "Your place in line has been updated." },
  { ahead: 22650, wait: "About 20 minutes", ms: 1000 },
  { ahead: 8432, wait: "About 8 minutes", ms: 900 },
  { ahead: 8432, wait: "About 8 minutes", ms: 2400, disconnect: true },
  { ahead: 1290, wait: "About 2 minutes", ms: 800 },
  { ahead: 87, wait: "Less than a minute", ms: 800 },
  { ahead: 0, wait: "Less than a minute", ms: 600 },
];
