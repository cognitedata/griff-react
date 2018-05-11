function createSeries(required) {
  return (props, propName, componentName) => {
    const incoming = props[propName];
    if (required && !incoming) {
      throw new Error(
        `Must supply a valid series object to ${componentName}.${propName}`
      );
    }
    Object.keys(incoming).forEach(key => {
      const series = incoming[key];
      if (!series || typeof series.data !== typeof []) {
        throw new Error(
          `Must supply a 'data' array to ${componentName}.${propName}.${series}`
        );
      }
    });
  };
}

function createHiddenSeries(required) {
  return (props, propName, componentName) => {
    const incoming = props[propName];
    if (required && !incoming) {
      throw new Error(
        `Must supply a valid [ { id: bool }, ... ] to ${componentName}.${propName}`
      );
    }
  };
}

function createColors(required) {
  return (props, propName, componentName) => {
    const incoming = props[propName];
    if (required && incoming === undefined) {
      throw new Error(
        `Must supply a valid [ { id: string }, ... ] to ${componentName}.${propName}`
      );
    }
    Object.keys(incoming).forEach(key => {
      const color = incoming[key];
      if (!color || typeof color !== typeof '') {
        throw new Error(
          `Must supply valid colors to ${componentName}.${propName}`
        );
      }
    });
  };
}

function createConfig(required) {
  return (props, propName, componentName) => {
    const incoming = props[propName];
    if (required && !incoming) {
      throw new Error(
        `Must supply a valid config object to ${componentName}.${propName}`
      );
    }
    if (typeof incoming !== 'object') {
      throw new Error(
        `Must supply a valid config object to ${componentName}.${propName}`
      );
    }
    // TODO: Validate the shape of the config object.
  };
}

function createAxisConfig(required) {
  return (props, propName, componentName) => {
    const incoming = props[propName];
    if (required && !incoming) {
      throw new Error(
        `Must supply a valid config object to ${componentName}.${propName}`
      );
    }
    if (typeof incoming !== 'object') {
      throw new Error(
        `Must supply a valid config object to ${componentName}.${propName}`
      );
    }
    if (incoming.mode !== undefined && typeof incoming.mode !== typeof '') {
      throw new Error(`${componentName}.${propName}.mode must be a string`);
    }
    if (
      incoming.accessor !== undefined &&
      typeof incoming.accessor !== 'function'
    ) {
      throw new Error(
        `${componentName}.${propName}.accessor must be a function`
      );
    }
    if (incoming.width !== undefined && Number.isNaN(incoming.width)) {
      throw new Error(`${componentName}.${propName}.width must be a number`);
    }
    if (incoming.height !== undefined && Number.isNaN(incoming.height)) {
      throw new Error(`${componentName}.${propName}.height must be a number`);
    }
  };
}

function createRescale(required) {
  return (props, propName, componentName) => {
    const incoming = props[propName];
    if (required && !incoming) {
      throw new Error(
        `Must supply a valid rescaler object to ${componentName}.${propName}`
      );
    }
    if (typeof incoming !== 'object') {
      throw new Error(
        `Must supply a valid rescaler object to ${componentName}.${propName}`
      );
    }
    Object.keys(incoming).forEach(key => {
      if (typeof incoming[key] !== 'function') {
        throw new Error(`${componentName}.${propName} should be { id: func }`);
      }
    });
  };
}

function createMargin(required) {
  return (props, propName, componentName) => {
    const incoming = props[propName];
    if (required && !incoming) {
      throw new Error(
        `Must supply a valid margin object to ${componentName}.${propName}`
      );
    }
    ['top', 'left', 'bottom', 'right'].forEach(side => {
      if (incoming[side] !== undefined && Number.isNaN(incoming[side])) {
        throw new Error(
          `${componentName}.${propName}.${side} must be a number`
        );
      }
    });
  };
}

export default class Validators {}

Validators.axisConfig = createAxisConfig(false);
Validators.axisConfig.isRequired = createAxisConfig(true);

Validators.colors = createColors(false);
Validators.colors.isRequired = createColors(true);

Validators.config = createConfig(false);
Validators.config.isRequired = createConfig(true);

Validators.hiddenSeries = createHiddenSeries(false);
Validators.hiddenSeries.isRequired = createHiddenSeries(true);

Validators.margin = createMargin(false);
Validators.margin.isRequired = createMargin(true);

Validators.rescaler = createRescale(false);
Validators.rescaler.isRequired = createRescale(true);

Validators.series = createSeries(false);
Validators.series.isRequired = createSeries(true);
