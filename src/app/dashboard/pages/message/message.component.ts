import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MessagesService } from '../../services/messages.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Message } from '../../interfaces';
import { DashboardService } from '../../services/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit , OnDestroy{
  private messagesService = inject(MessagesService);
  private dashboardService = inject(DashboardService);
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router);
  private messageSub: Subscription = new Subscription();
  public loadingMessage: boolean = false;
  public id!:string;
  public message!:Message;
  public messageItems: (keyof Message)[]  = [ 'fullName', 'email', 'subject', 'message'];

  ngOnInit(): void {
    this.loadingMessage = true;
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')!;
    })

    this.messageSub = this.messagesService.getMessageById(this.id).subscribe(resp =>{
      if(resp){
        this.message = resp;
      }else{
        this.dashboardService.notificationPopup('error','Algo salio mal al cargar el mensaje :(', 1500);
      }
      this.loadingMessage = false;
    });
  }

  ngOnDestroy(): void {
    this.messageSub.unsubscribe();
  }

  deleteMessage(id:string){
    this.dashboardService.confirmDelete().then((result) => {
      if (!result.isConfirmed) return;

        this.loadingMessage = true;
        this.messagesService.deleteMessage(id).subscribe(resp =>{
          if(resp){
            this.dashboardService.notificationPopup('success', 'Mensaje Eliminado', 1000);
            this.router.navigateByUrl('/lmdr')
          }else{
            this.dashboardService.notificationPopup('error', 'Algo Salio Mal :C', 1000);
          }
          this.loadingMessage = false;
        });
    })
  }
}
