import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminosypriComponent } from './terminosypri.component';

describe('TerminosypriComponent', () => {
  let component: TerminosypriComponent;
  let fixture: ComponentFixture<TerminosypriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminosypriComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerminosypriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
