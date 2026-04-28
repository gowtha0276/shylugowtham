import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingInviteComponent } from './wedding-invite.component';

describe('WeddingInviteComponent', () => {
  let component: WeddingInviteComponent;
  let fixture: ComponentFixture<WeddingInviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingInviteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
