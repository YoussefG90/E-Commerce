import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Types } from "mongoose";
import { Socket, Server } from "socket.io";
import { TokenEnum, TokenService } from "src/common";
import { AuthenticationGuard } from "src/common/guards/authentication/authentication.guard";
import {type  ISocketAuth } from "src/common/interfaces/socket";
import { getSocketAuth } from "src/common/utils/socket";
import { connectedSockets } from "src/DB";



@WebSocketGateway({cors:{origin:"*"}})
export class RealtimeGateway implements OnGatewayConnection , OnGatewayDisconnect , OnGatewayInit{
    private server: Server;
    constructor(private readonly tokenService:TokenService){}

    afterInit(server: Server) {
        this.server = server;
        console.log("Realtime gateway starred ✔");
    }

    async handleConnection(client:ISocketAuth) {
        try {
            const authorization = getSocketAuth(client)
            const {user,decoded} = await this.tokenService.decodedToken({authorization,tokenType:TokenEnum.access})
            const userTaps = connectedSockets.get(user._id.toString()) || []
            userTaps.push(client.id)
            connectedSockets.set(user._id.toString() , userTaps)
            client.credentials = {user,decoded}
        } catch (error) {
            client.emit("exception",error.message || "Something Went Wrong")
        }
    }

    handleDisconnect(client: ISocketAuth) {
      const userId = client.credentials?.user._id?.toString() as string;
      const existingSockets = connectedSockets.get(userId) || [];
      const updatedSockets = existingSockets.filter((id) => id !== client.id);
      if (updatedSockets.length > 0) {
        connectedSockets.set(userId, updatedSockets);
      } else {
        connectedSockets.delete(userId);
        this.server.emit('offline_user', userId);
      }
    }

    @UseGuards(AuthenticationGuard)
    @SubscribeMessage("sayHi")
    sayHi(@MessageBody() data:any ,@ConnectedSocket() client:ISocketAuth):string {
        this.server.emit("sayHi","Nest To FE")
        return "Received Data"
    }

    changeProductStock(products:{productId:Types.ObjectId,stock:number}[]){
        this.server.emit("changeProductStock",products)
    }
}
