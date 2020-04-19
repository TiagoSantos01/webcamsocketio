const 	Chave='sessao',
	ChaveSecreta='ticotest',
	Express =require('express'),
	CookieParser = require('cookie-parser'),
	ExpressSession = require('express-session'),
	App = Express(),
	Server= require('https'),
	Fs = require('fs'),
	Io = require('socket.io'),
	Cookie = CookieParser(ChaveSecreta),
	Store = new ExpressSession.MemoryStore();
const	options={
	key:	Fs.readFileSync('key.pem'),
	cert:	Fs.readFileSync('cert.pem')
};
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
Server.createServer(options,App).listen(3000);
Io.listen(Server);
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

App.get('/',(req,res)=>{
	req.session.nome="Tiago",
	res.render('home');	
});


Io.on('connection',(cliente)=>{
	let sessao=cliente.handshake.session;
	cliente.on('admin',(msg)=>{
	cliente.emit("admin",msg);
	cliente.broadcast.emit("admin",msg);
	});
});

//Server.createServer(options,App).listen(3000);
//	Io.listen(Server)

