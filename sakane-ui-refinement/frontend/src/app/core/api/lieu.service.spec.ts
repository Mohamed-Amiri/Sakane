import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { LieuService } from './lieu.service';

describe('LieuService', () => {
  let service: LieuService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LieuService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() sends page/size query params', () => {
    service.list(2, 24).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiBaseUrl}/api/lieux`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('24');
    req.flush({});
  });

  it('search() always sends page/size and only sends filters that were provided', () => {
    service.search({ keyword: 'riad' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiBaseUrl}/api/lieux/search`);
    expect(req.request.params.get('keyword')).toBe('riad');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('12');
    expect(req.request.params.has('type')).toBe(false);
    expect(req.request.params.has('minPrice')).toBe(false);
    expect(req.request.params.has('maxPrice')).toBe(false);
    expect(req.request.params.has('city')).toBe(false);
    req.flush({});
  });

  it('search() sends type/minPrice/maxPrice/city when provided', () => {
    service.search({ type: 'villa', minPrice: 100, maxPrice: 500, city: 'Casablanca', page: 1, size: 6 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiBaseUrl}/api/lieux/search`);
    expect(req.request.params.get('type')).toBe('villa');
    expect(req.request.params.get('minPrice')).toBe('100');
    expect(req.request.params.get('maxPrice')).toBe('500');
    expect(req.request.params.get('city')).toBe('Casablanca');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('6');
    req.flush({});
  });

  it('uploadPhotos() posts multipart form data under the "photos" field', () => {
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    service.uploadPhotos(7, [file]).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/lieux/7/photos`);
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).getAll('photos').length).toBe(1);
    req.flush([]);
  });

  it('deletePhoto() sends the url as a query param', () => {
    service.deletePhoto(7, 'https://example.com/a.jpg').subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/api/lieux/7/photos` && r.params.get('url') === 'https://example.com/a.jpg'
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
