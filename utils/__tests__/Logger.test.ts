import Logger, {LogLevel} from '../Logger';

const originalConsole = {...console};

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('debug', () => {
    it('should call console.log with debug message', () => {
      Logger.debug('test message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle tagged debug messages', () => {
      Logger.debug({tag: 'TestTag'}, 'tagged message');
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should call console.info with info message', () => {
      Logger.info('info message');
      expect(console.info).toHaveBeenCalled();
    });

    it('should handle tagged info messages', () => {
      Logger.info({tag: 'TestTag'}, 'tagged info');
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should call console.warn with warning message', () => {
      Logger.warn('warning message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle tagged warning messages', () => {
      Logger.warn({tag: 'TestTag'}, 'tagged warning');
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should call console.error with error message', () => {
      Logger.error('error message');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle tagged error messages', () => {
      Logger.error({tag: 'TestTag'}, 'tagged error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('withTag', () => {
    it('should create a logger instance with tag', () => {
      const taggedLogger = Logger.withTag('MyModule');
      expect(taggedLogger).toBeDefined();
      taggedLogger.info('message with tag');
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('setMinLevel', () => {
    it('should set minimum log level', () => {
      Logger.setMinLevel(LogLevel.ERROR);
      Logger.debug('should not appear');
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
