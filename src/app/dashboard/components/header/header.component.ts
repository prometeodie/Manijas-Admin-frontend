import { Component, ElementRef, OnInit, ViewChild, inject, Renderer2 } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import Swal from 'sweetalert2';
import { DashboardService } from '../../services/dashboard.service';
import { catchError, map, of } from 'rxjs';
import { Message } from '../../interfaces/message.interface';

@Component({
  selector: 'component-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent  implements OnInit {

  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private screenWidth: number = 0;
  public messageRoute: string = '/lmdr/message/'
  public isMessagesWindowOpen: boolean = false;
  public unreadMessages: number = 0;
  public messages: Message[]= [];
  public userEmail:string = this.authService.currentUser()?.nickname!;
  public userRole:string = this.authService.currentUser()?.roles[0]!;
  public isLoadingMessages: boolean = false;

  @ViewChild('messageMenu') messageMenu!: ElementRef;
  @ViewChild('messageWindowBtn') messageWindowBtn!: ElementRef;

  constructor( private renderer: Renderer2){
    this.renderer.listen('window', 'click', (event: Event) => {
      if (this.messageMenu && !this.messageMenu.nativeElement.contains(event.target) && !this.messageWindowBtn.nativeElement.contains(event.target)) {
        this.isMessagesWindowOpen = false;
      }
    });
  }


  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.getUnreadMessagesCount();
  }

  getUnreadMessagesCount(){
    this.dashboardService.getUnreadMessageCount()?.pipe(
      map(unreadMessages => unreadMessages?.unreadMessages),
      catchError(error => {
        return of(0);
      })
    ).subscribe((unreadMessageCount) => {
      if (unreadMessageCount !== null) {
        this.unreadMessages = unreadMessageCount!;
      }
    });
  }

getAllMessagesAndSlideMenu(){
  this.openCloseMessages();
  this.getAllMessages();
}

getAllMessages(){
  this.isLoadingMessages = true;
    this.dashboardService.getMessages()?.pipe(
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
}

openCloseMessages(){
  this.isMessagesWindowOpen = !this.isMessagesWindowOpen;
}

reduceSubjectCharacters(subject: string){
  let charactersCount: number;

  (this.screenWidth >= 500)? charactersCount = 50 : charactersCount = 25;

  return (subject.length > 27)? `${subject.slice(0,charactersCount)}...` : subject;
}

changeMessageStatus(id: string){
  this.dashboardService.messageHasBeenReaded(id).subscribe(
    resp=>{
      if(resp){
        this.getUnreadMessagesCount();
      }
    }
  );
  this.openCloseMessages()
}

logOut(){
  Swal.fire({
    title: 'Do you want to logOut?',
    text: "",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes!',
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.logOutUser();
    }
})
}
}
