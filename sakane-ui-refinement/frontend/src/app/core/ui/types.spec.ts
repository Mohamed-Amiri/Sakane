import { LABEL_TO_CODE, prettyType } from './types';

describe('types', () => {
  it('maps every known LieuResponse.type display label to a request code', () => {
    expect(LABEL_TO_CODE['Appartement']).toBe('appartement');
    expect(LABEL_TO_CODE['Maison']).toBe('maison');
    expect(LABEL_TO_CODE['Villa']).toBe('villa');
    expect(LABEL_TO_CODE['Studio']).toBe('studio');
    expect(LABEL_TO_CODE['Loft']).toBe('loft');
    expect(LABEL_TO_CODE['Chambre']).toBe('chambre');
    expect(LABEL_TO_CODE['Bureau']).toBe('office');
    expect(LABEL_TO_CODE['Salle_Evenement']).toBe('event_space');
  });

  it('prettyType renders a known label as English', () => {
    expect(prettyType('Bureau')).toBe('Office');
    expect(prettyType('Salle_Evenement')).toBe('Event space');
    expect(prettyType('Villa')).toBe('Villa');
  });

  it('prettyType falls back to underscore-replacement for unknown labels', () => {
    expect(prettyType('Some_Unknown_Type')).toBe('Some Unknown Type');
  });

  it('prettyType handles null/undefined without rendering "null"', () => {
    expect(prettyType(null)).toBe('—');
    expect(prettyType(undefined)).toBe('—');
  });
});
