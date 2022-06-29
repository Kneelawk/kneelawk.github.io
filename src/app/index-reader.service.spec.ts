import { TestBed } from '@angular/core/testing';

import { IndexReaderService } from './index-reader.service';

describe('IndexReaderService', () => {
  let service: IndexReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
