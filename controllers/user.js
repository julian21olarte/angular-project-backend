'use strict';
var bcrypt = require('bcrypt');
var userModel = require('../models/user');


function getUsers(req, res) {
  res.status(200).send({
    message: 'Probando la ruta de usuarios'
  })
}


function saveUser(req, res) {
  let params = req.body;
  
  if( params.name && params.email && params.password ) {
    let user = new userModel();
    userModel.findOne({email: params.email.toLowerCase()}, (err, userExist) => {
      if(err) {
        res.status(500).send({message: 'Error al comprobar si existe el usuario'});
      }
      else {
        if(!userExist) {
          bcrypt.hash(params.password, function(err, hash) {
            user.name = params.name;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.password = hash;
      
            user.save( (err, userStored) => {
              if(err) {
                res.status(500).send( {message: 'Error al guardar el usuario'} );
              }
              else {
                if( !userStored ) {
                  res.status(404).send( { message: 'No se ha registrado el usuario' } )  ;
                }
                else {
                  res.status(200).send( {user: userStored} );
                }
              }
            });
          }); 
        }
        else {
          res.status(200).send({message: 'El usuario ya existe'});
        }
      }
    });
  }
  else {
    res.status(200).send({message: 'Introduce los datos correctamente para poder registrar al usuario'});
  }
}


function login(req, res) {
  let params = req.body;
  userModel.findOne({email: params.email.toLowerCase()}, function(err, userExist){
    if(!userExist) {
      res.status(404).send({message: 'El usuario no existe'});
    }
    else {
      res.status(200).send( {user: userExist} );
    }
  });
}

module.exports = {
  getUsers,
  saveUser,
  login
}