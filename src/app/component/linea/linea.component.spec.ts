import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineaComponent } from './linea.component';

describe('LineaComponent', () => {
  let component: LineaComponent;
  let fixture: ComponentFixture<LineaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LineaComponent]
    });
    fixture = TestBed.createComponent(LineaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
