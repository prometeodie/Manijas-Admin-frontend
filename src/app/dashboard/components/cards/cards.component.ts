import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardTemplate } from '../../interfaces/cards.interface';
import { ImgPipePipe } from '../../pipes/img-pipe.pipe';
import { DashboardService } from '../../services/dashboard.service';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, ImgPipePipe, RouterModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  @Input() objectTemplate!: CardTemplate;
  @Output() delete = new EventEmitter<void>(); //TODO: this Output is to emmit an event, when the card is deleted successfuly the father lisen to this event and actualize the cards list
private dashboardService = inject(DashboardService);
 public isTheBoardVoted: boolean = false;
 public isEventCategory: boolean = false
 public imgUrl: string = '';
 public RouteToEditItem: string= '';


 ngOnInit(){
  this.RouteToEditItem = `/lmdr/create-edit/${this.objectTemplate.section}/${this.objectTemplate._id}`;
  (this.objectTemplate.section === 'EVENTS')? this.isEventCategory = true : this.isEventCategory = false;
  this.imgUrl = this.objectTemplate.imgPath;

  if(this.objectTemplate.imgPath.length > 0){
    (this.dashboardService.screenWidth > 800)?
      this.objectTemplate.imgPath = `assets/upload/${this.objectTemplate.section}/${this.objectTemplate.title}/${this.objectTemplate.imgPath}`:
      this.objectTemplate.imgPath = `assets/upload/${this.objectTemplate.section}/${this.objectTemplate.title}/optimize/smallS-${this.objectTemplate.imgPath}`;
  }
// TODO:acomodar bien el url cuando tenga el backend en produccion
 }

isBoardVoted(hasVoted: boolean){
  if(hasVoted){
    this.isTheBoardVoted = !this.isTheBoardVoted;
  }
  return;
}

deleteItem(id:string){
  const section = this.objectTemplate.section.toLocaleLowerCase();
  Swal.fire({
    title: "Estas seguro que lo deseas eliminar?",
    text: "No sera capaz de revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "borrar!"
  }).then((result) => {
    if (result.isConfirmed) {
      this.dashboardService.deleteEvent(id, section).subscribe(
        resp =>{
          if(resp){
            this.dashboardService.notificationPopup('success','item eliminado')
            this.delete.emit();
          }else{
            this.dashboardService.notificationPopup("error", 'Algo salio mal :(')
          }
        }
      )
    }
  });
}

}
