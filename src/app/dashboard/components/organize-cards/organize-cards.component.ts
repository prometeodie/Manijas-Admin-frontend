import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutItemOrganizing, Section } from '../../interfaces';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from '../../services/dashboard.service';
import Swal from 'sweetalert2';
import { catchError, of } from 'rxjs';
import { environment } from 'src/assets/environments/environment';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';

@Component({
  selector: 'organize-cards',
  standalone: true,
  imports: [CommonModule, DragDropModule, LoadingAnimationComponent],
  templateUrl: './organize-cards.component.html',
  styleUrls: ['./organize-cards.component.scss']
})
export class OrganizeCardsComponent implements OnInit {
  @Input() aboutItemOrganizing!: AboutItemOrganizing[];
  @Output() close = new EventEmitter<void>();
  @Output() orderCompleted = new EventEmitter<void>();
  readonly url = `${environment.baseUrl}/about`
  private http = inject(HttpClient);
  private dashboardService= inject(DashboardService);
  public aboutItems!: AboutItemOrganizing[];
  public loading:boolean = false;

  ngOnInit(): void {
    this.aboutItems = this.aboutItemOrganizing;
    this.aboutItems.forEach(item => {
      this.dashboardService.getImgUrl(item.img, Section.ABOUT).subscribe(imgUrl => {
        item.imgUrl = imgUrl;
      });
    })
  }

  closeOrganize(){
    this.close.emit();
  }

  getImgUrlEvent(image: string) {
          if (image){
              this.dashboardService.getImgUrl(image, Section.ABOUT).subscribe(resp => {
                return resp;
              });
            }
          }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.aboutItems, event.previousIndex, event.currentIndex);
  }

  saveOrder() {
    const headers = this.dashboardService.getHeaders();
    const orderedIds = this.aboutItems.map(item => item._id);
    return this.http.patch(`${this.url}/update-order`, orderedIds , {headers}).pipe(
    catchError((err)=>{return of(undefined)})
  )}

  saveChanges(){
    Swal.fire({
          title:"Guardar Cambios?",
          text: "",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si!'
        }).then((result) => {
          if(!result.isConfirmed) return;
          this.loading = true;
          this.saveOrder().subscribe(resp =>{
            if(resp){
              this.dashboardService.notificationPopup('success','Se ha Actualizado correctamente', 1500);
              this.orderCompleted.emit();
            }else{
              this.dashboardService.notificationPopup('error','Algo ha sucedido, intenta más tarde', 1500);
            }
          })
          this.loading = false;
        })
  }
}
