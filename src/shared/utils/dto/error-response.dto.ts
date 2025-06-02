export class ErrorResponseDto {
  constructor(statusCode: number, path: string) {
    this.statusCode = statusCode;
    this.path = path;
    this.timestamp = new Date().toISOString();
    this.status = 'KO';
    this.errors = [];
  }

  statusCode: number;
  status: string;
  timestamp: string;
  path: string;
  errors: Array<object>;
}
