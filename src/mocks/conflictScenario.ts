export function createConflictScenario() {
  let armed = false;
  return {
    get: () => armed,
    set: (value: boolean) => {
      armed = value;
    },
    consume: () => {
      const wasArmed = armed;
      armed = false;
      return wasArmed;
    },
  };
}
