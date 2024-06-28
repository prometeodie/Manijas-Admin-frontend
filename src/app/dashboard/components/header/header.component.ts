import { Component, OnInit, inject } from '@angular/core';
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

  public messageRoute: string = '/lmdr/message/'
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  public isMessagesWindowOpen: boolean = false;
  private screenWidth: number = 0;
  public unreadMessages: number = 0;
  public messages: Message[]= [];
  public userEmail:string = this.authService.currentUser()?.nickname!;
  public userRole:string = this.authService.currentUser()?.roles[0]!;

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
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

  logOut(){
    Swal.fire({
      title: 'Do you want to logOut?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logOutUser();
      }
  })
}

getAllMessages(){
  this.openCloseMessages();
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
      this.messages = messages!;

    });
}

openCloseMessages(){
  this.isMessagesWindowOpen = !this.isMessagesWindowOpen;
}

reduceSubjectCharacters(subject: string){
  let charactersCount: number;

  (this.screenWidth >= 500)? charactersCount = 50 : charactersCount = 25;

  return (subject.length > 27)? `${subject.slice(0,charactersCount)}...` : subject;
}

}
