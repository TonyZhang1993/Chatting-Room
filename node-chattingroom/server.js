//普通方法创建HTTP服务器
/*var http = require('http');

var server = http.createServer(function(req,res){
	res.writeHead(200, {
		'Content-Type':'text/html'
	});
	res.write('<h1>hello world</h1>');
	res.end();
});

server.listen(80);
console.log('server started');*/

//express是node.js中管理路由响应请求的模块，根据请求的URL返回相应的HTML页面。
var express = require('express'),
	app = express();
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	users = [];  //保存所有在线用户的昵称

app.use('/',express.static(__dirname+'/www'));
server.listen(80);
console.log('server started');

//socket 部分
io.on('connection', function(socket){
	//接收并处理客户端发送的foo事件
	socket.on('login',function(nickname){
		//将消息输出到控制台
		//console.log(data);
		if(users.indexOf(nickname) > -1){
			socket.emit('nickExisted');
		}else{
			socket.useIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');
			io.sockets.emit('system',nickname, users.length,'login');   //向所有连接到服务器的客户端发送当前登陆用户的昵称 
		};

		//断开连接的事件
		socket.on('disconnect', function() {
		    //将断开连接的用户从users中删除
		    users.splice(socket.userIndex, 1);
		    //通知除自己以外的所有人
		    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
		});
	});

	    //接收新消息
    socket.on('postMsg', function(msg) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });

	    //接收用户发来的图片
	 socket.on('img', function(imgData) {
	    //通过一个newImg事件分发到除自己外的每个用户
	     socket.broadcast.emit('newImg', socket.nickname, imgData);
	 });

});

//WebSocket协议是基于TCP的一种新的网络协议。它实现了浏览器与服务器全双工(full-duplex)通信——可以通俗的解释为服务器主动发送信息给客户端。
