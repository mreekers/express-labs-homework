// have to put in the require grab for our bcrypt and to generate
//the saltsync for our passwords
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    email: {
      // this should allow us to validate our email as true and
      // validate the length by being no less than 6 and no more than 30
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: [6, 30],
      }
    },
    // and this should establish our passwordDigest(salt the fish) to be true
    // as long as it is not empty and it will validate.
    passwordDigest: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    }
  }, 

  {
    // this will run a specific user(or instance)
    instanceMethods: {
      checkPassword: function(password) {
        return bcrypt.compareSync(password, this.passwordDigest);
      }
    },

    classMethods: {
      // this will salt the fish 
      encryptPassword: function(password) {
        var hash = bcrypt.hashSync(password, salt);
        return hash;
      },
      // this should create the secure password that has to be longer than
      // 6 characters; if it is shorter, will throw out the error message
      createSecure: function(email, password) {
        if(password.length < 6) {
          throw new Error("Make it bigger yo (that's what she said");
        }
        // this will return the created email and encrypted password
        return this.create({
          email: email,
          passwordDigest: this.encryptPassword(password)
          
        });

      }, 
     
      authenticate: function(email, password) {
        return this.find({
          where: {
            email: email
          }
        })
        .then(function(user){
          if (user === null){
            throw new Error("Email not here dude");
          }
          else if (user.checkPassword(password)){
            return user;
          }
        })
      }
     
    }
  });
  return User;
};










