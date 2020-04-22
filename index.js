const 	Chave='sessao',
	ChaveSecreta='ticotest',
      	Fs = require('fs'),
	Express =require('express'),
	CookieParser = require('cookie-parser'),
	ExpressSession = require('express-session'),
	App = Express(),
      	options={
		key:	Fs.readFileSync('key.pem'),
		cert:	Fs.readFileSync('cert.pem')
	},
	Server= require('https').createServer(options,App).listen(3000),
	Io = require('socket.io').listen(Server),
	Cookie = CookieParser(ChaveSecreta),
	Store = new ExpressSession.MemoryStore();

App.set('views', __dirname + '/views' );
App.set('view engine', 'ejs');
App.use(Cookie);
App.use(ExpressSession({
secret:	ChaveSecreta,
name:	Chave,
resave:	true,
saveUninitialized: true,
store:Store
}));

	
Io.use((socket,proximo)=>{
	let dados = socket.request;
	Cookie(dados,{},(err)=>{
		let SessaoID = dados.signedCookies[Chave];
		Store.get(SessaoID,(err,sessao)=>{
			if( err || !sessao ){
				return proximo(new Error('Acesso Negado! :( '));
			}else{
				socket.handshake.session=sessao;
				return proximo();
			}
		});
	});
});

App.get('/1',(req,res)=>{
	req.session.nome="Tiago",
	res.render('home');	
});
App.get('/2',(req,res)=>{
	req.session.nome="tico",
	res.render("home2");
});

Io.on('connection',(cliente)=>{
console.log("+");
	let sessao=cliente.handshake.session;
//console.log(cliente);	
cliente.on('admin',(msg)=>{
	//cliente.emit("admin",msg);
console.log(msg['sala'])
	cliente.broadcast.emit(msg['sala'],msg['msg']);
	});
});

