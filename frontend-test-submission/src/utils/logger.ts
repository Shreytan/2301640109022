import axios from 'axios';

interface LogData {
  stack: string;
  level: string;
  package: string;
  message: string;
}

class CustomLogger {
  private apiEndpoint: string;
  private client: any;

  constructor() {
    this.apiEndpoint = 'http://20.244.56.144/evaluation-service/logs';
    this.client = axios.create({
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async log(stack: string, level: string, packageName: string, message: string): Promise<string | null> {
    try {
      const logData: LogData = {
        stack: stack.toLowerCase(),
        level: level.toLowerCase(),
        package: packageName.toLowerCase(),
        message: message
      };

      const response = await this.client.post(this.apiEndpoint, logData);
      return response.data.logID;
    } catch (error: any) {
      console.error('Logging service error:', error.message);
      return null;
    }
  }

  debug(stack: string, packageName: string, message: string): Promise<string | null> {
    return this.log(stack, 'debug', packageName, message);
  }

  info(stack: string, packageName: string, message: string): Promise<string | null> {
    return this.log(stack, 'info', packageName, message);
  }

  warn(stack: string, packageName: string, message: string): Promise<string | null> {
    return this.log(stack, 'warn', packageName, message);
  }

  error(stack: string, packageName: string, message: string): Promise<string | null> {
    return this.log(stack, 'error', packageName, message);
  }

  fatal(stack: string, packageName: string, message: string): Promise<string | null> {
    return this.log(stack, 'fatal', packageName, message);
  }
}

export default new CustomLogger();
