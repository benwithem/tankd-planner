if (typeof MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      // Minimal polyfill for MessageChannel
      this.port1 = {
        postMessage: () => {},
        onmessage: null,
        close: () => {}
      };
      this.port2 = {
        postMessage: () => {},
        onmessage: null,
        close: () => {}
      };
    }
  };
}
