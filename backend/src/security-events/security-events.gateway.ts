import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SecurityEvent } from "./security-event.entity";

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000" },
  namespace: "/events",
})
export class SecurityEventsGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    if (tenantId) {
      client.join(`tenant:${tenantId}`);
    }
  }

  notifyNewEvent(event: SecurityEvent) {
    this.server.to(`tenant:${event.tenantId}`).emit("newEvent", event);
  }

  notifyEventUpdate(event: SecurityEvent) {
    this.server.to(`tenant:${event.tenantId}`).emit("eventUpdate", event);
  }

  @SubscribeMessage("subscribe")
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string }
  ) {
    client.join(`tenant:${data.tenantId}`);
    return { event: "subscribed", data: { tenantId: data.tenantId } };
  }
}
