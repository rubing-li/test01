var wsObj = null;
var wsUri = null;
var userId = -1;
var lockReconnect = false;
var wsCreateHandler = null;

//创建连接
function createWebSocket(){
    var host = window.location.host;
    userId = GetQueryString("userId");
    wsUri = "ws://"+host+"/websocket/"+userId;
    try {
        wsObj = new WebSocket(wsUri);
        initWsEventHandle();
    } catch (error) {
        writeToScreen("执行关闭事件，开始重连");
        reconnect();
    }
}

// function initWsEventHandle(){
//     try {
//         wsObj.onopen=function(evt){
//             onWsOpen(evt);
//         }
//     } catch (error) {
//         writeToScreen("执行关闭事件，开始重连");
//     }
// }

function initWsEventHandle(){
    try {
        //当服务器端已经连接成功，触发下面的方法
        wsObj.onopen=function(evt){
            onWsOpen(evt);
            //心跳检测
            heartCheck.start();
        };
        //服务端发送消息过来时
        wsObj.onmessage=function(evt){
            onWsMessage(evt);
            heartCheck.start();
        };
        wsObj.onclose=function(evt){
            writeToScreen("执行关闭事件，开始重连");
            onWsClose(evt);
            reconnect();
        };
        wsObj.onerror = function(evt){
            writeToScreen("执行error事件，开始重连");
            onWsError(evt);
            reconnect();
        };

    } catch (error) {
        writeToScreen("绑定事件没有成功");
        reconnect();
    }
}

function onWsOpen(evt){
    writeToScreen("CONNECTED");
}

function onWsClose(evt){
    writeToScreen("DISCONNECTED");
}

function onWsError(evt){
    writeToScreen("evt.data");
}

function writeToScreen(){
    if(DEBUG_FLAG){
        $("#debuggerInfo").val($("#debuggerInfo").val()+"\n"+message);
    }
}

function GetQueryString(name){
    var reg = new RegExp("(^|&)"+name+"=([^&]*)(&|$)","i");
    var r = window.location.search.substr(1).match(reg);
    var context="";
    if(r != null){
        context = r[2];
    }
    reg = null;
    r = null;
    return context == null || context == "" || context == "undefined" ? "":context;
}

//重连
function reconnect(){
    if (lockReconnect){
        return;
    }
    writeToScreen("1s后重连");
    lockReconnect=true;
    //没有连接上会一直重连，设置延迟避免请求过多
    wsCreateHandler && clearTimeout(wsCreateHandler);
    wsCreateHandler = setTimeout(function (){
        writeToScreen("重连..."+wsUri);
        createWebSocket();
        lockReconnect = false;
        writeToScreen("重连完成");

    },1000);
}
//心跳检测
var heartCheck = {
    //15s之内如果没有收到后台的消息，则认为是连接断开了，需要再次连接
    timeout:15000,
    timeoutObj:null,
    serverTimeoutObj:null,
    //重启
    reset:function (){
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        this.start();
    },
    //开启定时器
    start:function (){
        var self = this;
        this.timeoutObj&&clearTimeout(this.timeoutObj);
        this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
        this.timeoutObj = setTimeout(function (){
            writeToScreen("发送ping到后台");
            try {
                wsObj.send("ping");
            }catch (e) {
                writeToScreen("发送ping异常");
            }
            //内嵌计时器
            self.serverTimeoutObj=setTimeout(function () {
                writeToScreen("没有收到后台数据，关闭连接");
                reconnect();
            },self.timeout);

        },this.timeout);
    },
}

