package com.fawvw.webscocket.config;

import javax.websocket.Session;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author Li Rubing
 * @create 2021-04-21 17:38
 */
public class SessionPool {
    //线程安全
    public static Map<String, Session> sessions = new ConcurrentHashMap<>();

    public static void close(String sessionId) throws IOException {
        for (String userId : SessionPool.sessions.keySet()) {
            Session session = SessionPool.sessions.get(userId);
            if (session.getId().equals(sessionId)){
                sessions.remove(userId);
                break;
            }
        }
    }

    public static void sendMessage(String sessionId,String message) {
        sessions.get(sessionId).getAsyncRemote().sendText(message);
    }

    /**
     * 群发消息
     * @param message
     */
    public static void sendMessage1(String message) {
        for (String sessionId : SessionPool.sessions.keySet()) {
            SessionPool.sessions.get(sessionId).getAsyncRemote().sendText(message);

        }
    }

    /**
     * 点对点发消息
     * @param params
     */
    public static void sendMessage(Map<String,Object> params) {
        //{"fromUserId":userId,"toUserId":toUserId,"msg":msg};
        String toUserId = params.get("toUserId").toString();
        String fromUserId = params.get("fromUserId").toString();
        String msg = params.get("msg").toString();
        msg = "来自"+fromUserId+"的消息："+msg;
        Session session = sessions.get(toUserId);
        if (session != null){
            //异步发送消息
            session.getAsyncRemote().sendText(msg);
        }

    }

}
