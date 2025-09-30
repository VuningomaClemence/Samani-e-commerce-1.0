import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmoireComponent } from './armoire.component';

describe('ArmoireComponent', () => {
  let component: ArmoireComponent;
  let fixture: ComponentFixture<ArmoireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArmoireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArmoireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
