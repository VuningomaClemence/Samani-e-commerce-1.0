import { ComponentFixture, TestBed } from '@angular/core/testing';
import ChaisesComponent from './chaises.component';

describe('ChaisesComponent', () => {
  let component: ChaisesComponent;
  let fixture: ComponentFixture<ChaisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChaisesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChaisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
