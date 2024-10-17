import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardTemplate } from '../../interfaces/card interface/cards.interface';
import { ImgPipePipe } from '../../pipes/img-pipe.pipe';
import { DashboardService } from '../../services/dashboard.service';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, ImgPipePipe, RouterModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  @Input() objectTemplate!: CardTemplate;
  @Output() delete = new EventEmitter<void>(); //TODO: this Output emmits an event, when the card is deleted successfuly the father lisen to this event and actualize the cards list
private dashboardService = inject(DashboardService);
private authService = inject(AuthService);
 public isTheBoardVoted: boolean = false;
 public isEventCategory: boolean = false
 public hasVoted: boolean = false;
 public imgUrl: string = '';
 public routeToEditItem: string= '';
 public routeToVoteBoard: string= '';


 ngOnInit(){
  this.routeToEditItem = `/lmdr/create-edit/${this.objectTemplate.section}/${this.objectTemplate._id}`;
  this.routeToVoteBoard = `/lmdr/manijometro/${this.objectTemplate._id}`;
  this.objectTemplate.text = this.dashboardService.stripHtml(this.objectTemplate.text!);
  (this.objectTemplate.section === 'EVENTS')? this.isEventCategory = true : this.isEventCategory = false;
  this.imgUrl = this.objectTemplate.imgPath;
  this.hasUserVoted();
  if(this.objectTemplate.imgPath){
    (this.dashboardService.screenWidth > 800)?
      this.objectTemplate.imgPath = `assets/upload/${this.objectTemplate.section}/${this.objectTemplate.title}/${this.objectTemplate.imgPath}`:
      this.objectTemplate.imgPath = `assets/upload/${this.objectTemplate.section}/${this.objectTemplate.title}/optimize/smallS-${this.objectTemplate.imgPath}`;
      // TODO:acomodar bien el url cuando tenga el backend en produccion/ cambiar por la id ya que las fotos ahora se guardan con el id
  }
 }

 truncateText(text:string, maxLength:number) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

stripHtml(html: string){
  this.dashboardService.stripHtml(html)
}
isBoardVoted(hasVoted: boolean){
  if(hasVoted){
    this.isTheBoardVoted = !this.isTheBoardVoted;
  }
  return;
}

hasUserVoted(){
  if(this.objectTemplate.manijometroPool){
    if(this.objectTemplate.manijometroPool!.filter(manijometro => manijometro.userId === this.authService.currentUser()!._id).length !== 0){
      this.hasVoted = true;
    }
  }
}

saveCurrentUrl(route: string){
  this.dashboardService.saveCurrentUrl(route);
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
      this.dashboardService.deleteItem(id, section).subscribe(
        resp =>{
          if(resp){
            const path = `${this.objectTemplate.title}`;
            this.dashboardService.notificationPopup('success','item eliminado', 1500)
            this.dashboardService.deleteItemImg(path,section)?.subscribe()
            this.delete.emit();
          }else{
            this.dashboardService.notificationPopup("error", 'Algo salio mal :(', 2000)
          }
        }
      )
    }
  });
}

}
