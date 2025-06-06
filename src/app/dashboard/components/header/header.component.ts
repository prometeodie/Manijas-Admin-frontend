import { Component, ElementRef, OnInit, ViewChild, inject, Renderer2, OnDestroy } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import Swal from 'sweetalert2';
import { DashboardService } from '../../services/dashboard.service';
import { catchError, map, of, Subscription } from 'rxjs';
import { Message } from '../../interfaces/messages interfaces/message.interface';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'component-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent  implements OnInit, OnDestroy{

  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private messagesService = inject(MessagesService);
  private messagesSubcriptions: Subscription = new Subscription();
  public messageRoute: string = '/lmdr/message/'
  public isMessagesWindowOpen: boolean = false;
  public unreadMessages: number = 0;
  public messages: Message[]= [];
  public userEmail:string = this.authService.currentUser()?.nickname!;
  public userRole:string = this.authService.currentUser()?.roles[0]!;
  public isLoadingMessages: boolean = false;

  @ViewChild('messageMenu') messageMenu!: ElementRef;
  @ViewChild('messageWindowBtn') messageWindowBtn!: ElementRef;
  @ViewChild('deleteOption') deleteOption!: ElementRef;

  constructor( private renderer: Renderer2){
    this.renderer.listen('window', 'click', (event: Event) => {
      const target = event.target as Node;
      if (this.messageMenu
        && this.messageMenu.nativeElement
        && !this.messageMenu.nativeElement.contains(target)
        && this.messageWindowBtn.nativeElement
        && !this.messageWindowBtn.nativeElement.contains(target)
        && !document.querySelector('.swal2-popup')?.contains(target) ) {
        this.isMessagesWindowOpen = false;
      }
    });
  }

  ngOnInit(): void {
    this.getUnreadMessagesCount();
  }

  ngOnDestroy(): void {
    this.messagesSubcriptions.unsubscribe();
  }

  getUnreadMessagesCount(){

    const sub = this.messagesService.getUnreadMessageCount()?.pipe(
      map(unreadMessages => unreadMessages?.unreadMessages),
      catchError(error => {
        return of(0);
      })
    ).subscribe((unreadMessageCount) => {
      if (unreadMessageCount !== null) {
        (unreadMessageCount! > 99)? this.unreadMessages = 99 : this.unreadMessages = unreadMessageCount!;
      }
    });

    this.messagesSubcriptions.add(sub);

  }

getAllMessagesAndSlideMenu(){
  this.openCloseMessages();
  this.getAllMessages();
}

getAllMessages(){
  this.isLoadingMessages = true;
    const sub = this.messagesService.getMessages()?.pipe(
      map(messages => {
        if (messages !== null) {
        return messages?.sort((a,b)=>{
        const dateA = new Date(a.creationDate);
        const dateB = new Date(b.creationDate);
        if (a.hasBeenReaded === b.hasBeenReaded) {
          return dateB.getTime() - dateA.getTime();
        }
        return a.hasBeenReaded ? 1 : -1;
      })!;
    }
    return [];
  } ),
      catchError(error => {
        return of([]);
      })
    ).subscribe(
      (messages) => {
        this.isLoadingMessages = false;
        this.messages = messages!;
      },
    );

    this.messagesSubcriptions.add(sub);
}

openCloseMessages(){
  this.isMessagesWindowOpen = !this.isMessagesWindowOpen;
}

changeMessageStatus(id: string){
  const sub = this.messagesService.messageHasBeenReaded(id).subscribe(
    resp=>{
      if(resp){
        this.getUnreadMessagesCount();
        this.isMessagesWindowOpen = false;
      }
    }
  );
  this.messagesSubcriptions.add(sub);
}

deleteMessage(id:string, event: Event){
  event.stopPropagation();
  Swal.fire({
    title: 'Eliminar Mensaje?',
    text: "",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes!',
  }).then((result) => {
    if(result.isConfirmed) {
      const sub = this.messagesService.deleteMessage(id).subscribe(resp=>{
        if(resp){
          this.dashboardService.notificationPopup('success','Mensaje eliminado',1500)
          this.getAllMessages();
        }else{
          this.dashboardService.notificationPopup("error", 'Algo salio mal :(',2000)
        }
      })
      this.messagesSubcriptions.add(sub);
    };
  })
}

logOut(){
    Swal.fire({
      title: 'Cerrar sesión?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
    }).then((result) => {
      if(result.isConfirmed) {this.authService.logOutUser()};
    })
  }
}

