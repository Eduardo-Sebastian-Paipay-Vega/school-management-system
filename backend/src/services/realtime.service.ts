import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { AuthService } from './auth.service';
import { NotificationService } from './notifications.service';

export function attachRealtime(server: Server): void {
  const wss=new WebSocketServer({noServer:true});
  server.on('upgrade',async(request,socket,head)=>{
    const origin=request.headers.origin;
    const allowed=(process.env.CORS_ORIGIN??'').split(',').map((x)=>x.trim());
    if(request.url!=='/api/v1/notifications/ws' || !origin || !allowed.includes(origin)){
      socket.destroy();return;
    }
    const protocols=request.headers['sec-websocket-protocol']?.split(',').map((x)=>x.trim())??[];
    if(protocols[0]!=='bearer' || !protocols[1]){socket.destroy();return;}
    try{
      const user=await AuthService.validateAccess(AuthService.accessClaims(protocols[1]),false);
      if(!user){socket.destroy();return;}
      wss.handleUpgrade(request,socket,head,(ws)=>{
        const token=protocols[1];
        const unsubscribe=NotificationService.subscribe(user.tenantId,user.id,async(event)=>{
          if(ws.readyState!==ws.OPEN)return;
          try{
            const current=await AuthService.validateAccess(AuthService.accessClaims(token),false);
            if(!current){ws.close(1008,'Sesión vencida');return;}
            if(ws.readyState===ws.OPEN)ws.send(JSON.stringify(event));
          }catch{ws.close(1011,'Autenticación no disponible');}
        });
        ws.on('close',unsubscribe);
        ws.on('error',unsubscribe);
        const recheck=setInterval(async()=>{
          try{if(!await AuthService.validateAccess(AuthService.accessClaims(token),false)) ws.close(1008,'Sesión vencida');}
          catch{ws.close(1011,'Autenticación no disponible');}
        },60_000);
        ws.on('close',()=>clearInterval(recheck));
        ws.send(JSON.stringify({type:'connected'}));
      });
    }catch{socket.destroy();}
  });
}
