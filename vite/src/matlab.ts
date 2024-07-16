interface MatlabEvent {
  Data?: unknown;
}

declare global {
  interface Window {
    matlab: {
      sendEventToMATLAB(eventName: string, eventData: unknown): void;
      addEventListener(
        eventName: string,
        handler: (event: MatlabEvent) => void,
      ): void;
    };
    matlabEventListenerCache: Map<string, (event: MatlabEvent) => void>;
  }
}

export function sendEventToMatlab(eventName: string, eventData?: unknown) {
  window.matlab.sendEventToMATLAB(eventName, eventData);
}

window.matlabEventListenerCache = new Map();

export function addMatlabEventListener(
  eventName: string,
  handler: (data?: any) => void,
) {
  if (window.matlab == undefined) {
    window.matlabEventListenerCache.set(eventName, (event) => {
      handler(event.Data);
    });
  } else {
    window.matlab.addEventListener(eventName, (event) => {
      handler(event.Data);
    });
  }
}
