'use strict';
var bcrypt = require('bcrypt');
var userModel = require('../models/User');
var jwt_service = require('../services/jwt');
var fs = require('fs');

//get all users
function getUsers(req, res) {
  res.status(200).send({
    message: 'Todos los usuarios'
  });
}


// save user in DB
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
          const salt = 10;
          bcrypt.hash(params.password, salt, function(err, hash) {
            user.name = params.name;
            user.email = params.email;
            user.role = params.role ? params.role : 'ROLE_USER';
            user.password = hash;
            console.log(user.password);
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


//Login function
function login(req, res) {
  let params = req.body;
  userModel.findOne({email: params.email.toLowerCase()}, function(err, userExist){
    if(!userExist) {
      res.status(404).send({message: 'El usuario no existe'});
    }
    else {
      bcrypt.compare(params.password, userExist.password, ( err, check ) => {
        if( check ) {
          if( params.gettoken ) {
            res.status(200).send( {token: jwt_service.createToken(userExist) } );
          }
          else {
            res.status(200).send( {message: 'Usuario no logueado' } );
          }
        }
        else {
          res.status(200).send( {message: 'El usuario no ha podido loguearse correctamente.'} );
        }
      });
    }
  });
}


//Test token function
function test_auth(req, res) {
  res.status(200).send({
    message: 'Autenticacion correcta.',
    user: req.user
  });
}


//update a user
function updateUser( req, res ) {
  var userId = req.params.id;
  var update = req.body;

  if( userId != req.user.sub ) {
    return res.status(500).send({ message: 'No tienes permiso para actualizar el usuario' });
  }
  userModel.findByIdAndUpdate( userId, update, {new: true}, ( err, userUpdated ) => {
    if(err) {
      res.status(500).send({ message: 'Error al actualizar usuario' });
    }
    else {
      if( !userUpdated ) {
        res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });
      }
      else {
        res.status(200).send({ message: 'Usuario actualizado', user: userUpdated });
      }
    }
  });
}


//uploads images for users
function uploadImage(req, res) {

  var userId = req.params.id;
  var fileName = 'no subido';

  if( req.files ) {
    var file_path = req.files.image.path;
    var file_split = file_path.split('\\');
    var file_name = file_split[2];
    var ext_file = file_name.split('.')[1];
    if( ext_file == 'png' || ext_file == 'jpg' || ext_file == 'jpeg' || ext_file == 'gif') {
      if( userId != req.user.sub ) {
        return res.status(500).send({ message: 'No tienes permiso para actualizar el usuario' });
      }
      userModel.findByIdAndUpdate( userId, { image: file_name }, ( err, userUpdated ) => {
        if(err) {
          res.status(500).send({ message: 'Error al actualizar usuario' });
        }
        else {
          if( !userUpdated ) {
            res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });
          }
          else {
            console.log(fs.existsSync(('./uploads/users/' + userUpdated.image) ));
            console.log(userUpdated.image);
            if( userUpdated.image && fs.existsSync(('./uploads/users/' + userUpdated.image) ) ) {
              fs.unlink( ('./uploads/users/' + userUpdated.image), function(err) {
                if(err) {
                  res.status(500).send({ message: 'Error al actualizar la imagen' });
                }
                else {
                  res.status(200).send({ message: 'Imagen actualizada correctamente', user: userUpdated, image: file_name });
                }
              });
            }
            else {
              res.status(200).send({ message: 'Imagen actualizada correctamente', user: userUpdated, new_image: file_name });
            }
          }
        }
      });
    }
    else {
      fs.unlink( (file_path), function(err) {
        if(err) {
          res.status(500).send({ message: 'Error al borrar la imagen y extension no valida.' });
        }
        else {
          res.status(200).send({ message: 'Extension no valida: '+ext_file });
        }
      });
    }
  }
  else {
    res.status(200).send({ message: 'No se ha subido nada' });
  }

}



module.exports = {
  getUsers,
  saveUser,
  login,
  test_auth,
  updateUser,
  uploadImage
}