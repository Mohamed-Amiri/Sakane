import { apiErrorMessage, validationErrorsFrom } from './api-error-presenter';
import { ApiError } from './models';

describe('apiErrorMessage', () => {
  it('maps 403 to a fixed permission message regardless of body', () => {
    const err: ApiError = { status: 403, body: { status: 403, error: 'Access Denied', message: 'nope', path: '', timestamp: '' } };
    expect(apiErrorMessage(err)).toBe("You don't have permission to do that.");
  });

  it('prefers the body message when present', () => {
    const err: ApiError = { status: 400, body: { status: 400, error: 'Bad Request', message: 'Invalid status transition: EN_ATTENTE -> TERMINEE', path: '', timestamp: '' } };
    expect(apiErrorMessage(err)).toBe('Invalid status transition: EN_ATTENTE -> TERMINEE');
  });

  it('uses the conflict override for an empty-body 409', () => {
    const err: ApiError = { status: 409, body: null };
    expect(apiErrorMessage(err, { conflict: 'Those dates were just taken. Pick new dates.' })).toBe(
      'Those dates were just taken. Pick new dates.'
    );
  });

  it('falls back to a default conflict message for 409 with no override', () => {
    const err: ApiError = { status: 409, body: null };
    expect(apiErrorMessage(err)).toBe('Those dates are no longer available.');
  });

  it('uses the serverError override for an empty-body 500', () => {
    const err: ApiError = { status: 500, body: null };
    expect(apiErrorMessage(err, { serverError: 'This reservation can no longer be cancelled.' })).toBe(
      'This reservation can no longer be cancelled.'
    );
  });

  it('falls back to a generic message for any other empty-body status', () => {
    const err: ApiError = { status: 400, body: null };
    expect(apiErrorMessage(err, { generic: 'Could not create the reservation.' })).toBe('Could not create the reservation.');
  });

  it('treats status 0 as unreachable server', () => {
    const err: ApiError = { status: 0, body: null };
    expect(apiErrorMessage(err)).toBe('Cannot reach the server. Check your connection and try again.');
  });

  it('validationErrorsFrom extracts the field map from a ValidationErrorResponse', () => {
    const err: ApiError = {
      status: 400,
      body: {
        status: 400,
        error: 'Validation Failed',
        message: 'Request validation failed',
        path: '',
        timestamp: '',
        validationErrors: { email: 'Email should be valid' }
      }
    };
    expect(validationErrorsFrom(err)).toEqual({ email: 'Email should be valid' });
  });

  it('validationErrorsFrom returns null for a plain ErrorResponse', () => {
    const err: ApiError = { status: 400, body: { status: 400, error: 'Bad Request', message: 'x', path: '', timestamp: '' } };
    expect(validationErrorsFrom(err)).toBeNull();
  });
});
