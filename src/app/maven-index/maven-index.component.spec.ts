import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MavenIndexComponent } from './maven-index.component';

describe('MavenIndexComponent', () => {
  let component: MavenIndexComponent;
  let fixture: ComponentFixture<MavenIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MavenIndexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MavenIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
