/** ერთიანი შეცდომის კლასი — იგივე ინტერფეისი, რაც ძველ HTTP ფენას ჰქონდა */
export class ApiError extends Error {
  constructor(message, status = 400, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}
