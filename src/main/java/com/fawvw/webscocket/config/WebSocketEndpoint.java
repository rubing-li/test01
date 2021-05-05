package com.fawvw.webscocket.config;

import com.alibaba.fastjson.JSON;
import org.springframework.stereotype.Component;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Li Rubing
 * @create 2021-04-21 17:21
 */
//ws://localhost:8080/websocket/A
@ServerEndpoint(value = "/websocket/{userId}")
@Component
public class WebSocketEndpoint {
    //与某个客户端的连接会话，需要通过它来给客户端发送数据
    private Session session;

    /**
     * 连接建立成功调用的方法
     * @param session
     * @param userId
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId){
        //把会话存入到连接池中
        SessionPool.sessions.put(userId,session);

    }
    @OnClose
    public void onClose(Session session) throws IOException {
        SessionPool.close(session.getId());
        session.close();
    }

    /**
     * 收到客户端消息后调用的方法
     * @param message
     * @param session
     */
    @OnMessage
    public void onMessage(String message,Session session){
        //Map<String,Object> params = JSON.parseObject(message, new HashMap<String, Object>().getClass());
      //  SessionPool.sendMessage(params);
        //判断是否是心跳信息
        if(message.equalsIgnoreCase("ping")){
            HashMap<String, Object> params = new HashMap<>();
            params.put("type","pong");
            try {
                //getBasicRemote()是同步阻塞的
                session.getBasicRemote().sendText(JSON.toJSONString(params));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }else{
            Map<String,Object> params = JSON.parseObject(message, new HashMap<String, Object>().getClass());
            SessionPool.sendMessage(params);
        }
    }
}
