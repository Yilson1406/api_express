//requerimos el milguar logger
// const logger = require('./logger')
//requerimos a express
const express = require('express');
const app = express();

const iniciodebug = require('debug')('app:inicio');
const iniciobd= require('debug')('app:db');

const config = require('config');
//requerir morgan para contar las peticiones que se hacen a mi api
const morgan = require('morgan');

//requerimos joi para validar los datos que resibvimos del usuario
const joi = require('@hapi/joi');
const { required } = require('@hapi/joi');
// const log = require('./logger');

//configuracion de entorno
console.log('Aplicacion' + config.get('nombre'));
console.log('Base de datos:' + config.get('configDB.host'));

//utilizamos json para poder trabajar con json
app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use(express.static('public'));

//uso de un middleware de tercero -Morgan

app.use(morgan('tiny'));
// console.log('morgan habilitado');
iniciodebug('morgan')
iniciobd('dbs')
// app.use(logger);

// app.use(function(req, res, next) {
//     console.log('Autenticando....');
//     next();
// });


//array de usuarios
const users =[
    {id:1, nombre:'yilson'},
    {id:2, nombre:'user2'},
    {id:3, nombre:'ana'}
] 

//mostrar datos desde la carpeta raiz
app.get('/',(req, res) =>{
    res.send('Hola mundo desde express');     
});

//mostrar usuarios
app.get('/api/usuarios', (req, res)=>{
    res.send(users);
});

//mostrar usuario por id
app.get('/api/usuarios/:id', (req, res)=>{
    let usuario = existeusuario(req.params.id);
    if (!usuario) res.status(404).send('el usuario no fue encontrado');
    res.send(user);
    
});

//guardar datos de usuario
app.post('/api/usuarios', (req, res)=>{
    //utilizamos un objeto schema para validar los datos que recibimos
    //controlamos la validacion del campo nombre, de la funcion que valid el usuario.
    const {error, value} = valuser(req.body.nombre);
    //si no existe error se guarda el dato.
    if (error) {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);          
        return; 
    }

    const usuario ={
        id:users.length +1,
        nombre:value.nombre} 
    //validar el usuario
    users.push(usuario)
    res.send(users);


});

app.put('/api/usuarios/:id',(req, res)=>{
    //encontrar si existe el usuario para modificar
    // let user=users.find(u => u.id === parseInt(req.params.id));
    // if (!user) res.status(404).send('el usuario no fue encontrado');

    let usuario = existeusuario(req.params.id);
    if (!usuario) {
        res.status(404).send('el usuario no fue encontrado');
        return;
    }

    //controlamos la validacion del campo nombre, de la funcion que valid el usuario.
    const {error, value} = valuser(req.body.nombre);
    //si no existe error se guarda el dato.
    if (error) {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);          
        return; 
    }

    //validar el usuario
    usuario.nombre = value.nombre;
    res.send(users);

});

app.delete('/api/usuarios/:id', (req, res)=>{

    let usuario = existeusuario(req.params.id);
    if (!usuario){
        res.status(404).send('El usuario no existe');
        return;
    } 

    const index = users.indexOf(usuario);
    users.splice(index,1);
    res.send(users);

});

//metodo para validar si existe un usuario
function existeusuario(id){
    return(users.find(u => u.id === parseInt(id)));

}

//metodo para validar la longitud del usuario, 
function valuser(nom){
     //utilizamos un objeto schema para va lidar los datos que recibimos
     const schema= joi.object({
        //el campo nombre debe de ser de tipo string, minimo 3 carapteres, y debe ser requerido.
        nombre: joi.string().min(3).required()
    });
   return (schema.validate({nombre: nom}));
}

//creamos una variable de entorno por si el puerto 3000 esta ocupado.
const port = process.env.PORT || 3000;

//escuchamos en el puerto 3000
app.listen(port, ()=>{
    console.log(`Escuchando en el puerto ${port}....`);
});
