var express = require('express');
   bodyParser = require('body-parser'),
   db = require("./models"),
   session = require("express-session"),
    ejs = require('ejs'),
    methodOverride = require('method-override'),
    pg = require("pg"),
    app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'super secret',
    resave: false,
    saveUninitialized: true
}));

// app.get('/articles', function(req,res) {
//     db.Article.all().then(function(dbArticle) {
//         res.render('article/index', {articlesList: dbArticles})
//     });
//   console.log("GET /articles");
//   res.send("Set up a response for this route!");
// });

//***NEW CODE FOR AUTHENTICATION***

// *** PART 1 - SETUP

app.use("/", function (req, res, next) {
    req.login = function (user) {
        req.session.userId = user.id;
    };

// this will request the current user's id
    req.currentUser = function() {
        return db.User.find({
            where: {
                id: req.session.userId
            }
        }).
        // this will return the requested user
        then(function(user) {
            req.user = user;
            return user;
        })
    };
    // this will request the logout of the session for the user
    req.logout = function() {
        req.session.userId = null;
        req.user = null;
    }

    next();
});

// have to get the signup route and let user know it is coming soon
app.get("/signup", function (req, res) {
    res.render("signup");
});

app.post('/signup', function (req, res) {
  var user = req.body.user;
    db.User.createSecure(user.email, user.password)
     .then(function(dbUser) {
         res.redirect("/login");
     });
});

// this is where the user will submit the sign up form


// this should request the user's id at the login in general (specific and
// current users will come next)


//*** PART 2 - ROUTING


// this code will redirect the user from the login route to their 
// profile route

// this is what the the route to profile will show to the user

app.get("/login", function (req, res) {
    res.render("login");
});

//where the form goes

app.post("/login", function (req, res) {
   var user = req.body.user;
   
   db.User.
   authenticate(user.email, user.password).
   then(function (user) {
       req.login(user);
       res.redirect("/profile");
   });
});


app.get("/profile", function (req, res) {
    req.currentUser().
        then(function (user) {
            res.render("profile.ejs", {user: user});
        })
});





//***ORIGINAL CODE FROM FIRST ASSIGNMENT***
app.get('/articles', function(req,res) {
  db.Article.findAll({ include: db.Author })
  	.then(function(dbArticles) {
  		res.render('articles/index', { articlesList: dbArticles });
  	})
});

// normal code for rendering new articles page
// app.get('/articles/new', function(req,res) {
//   res.render('articles/new');
// });
app.get('/articles/new', function(req,res) {
	db.Author.all().then(function(dbAuthors) {
		res.render('articles/new', { ejsAuthors: dbAuthors });		
	});

});

// next is the normal code for creating a new article and doesn't have to be refracted
// since it is just creating a new page and doesn't need author model involved

app.post('/articles', function(req,res) {
	db.Article.create(req.body.article).then(function(dbArticle) {
			res.redirect('/articles');
	});
});
  // don't think we need this -
  // console.log(req.body);
  // res.send("Set up a response for this route!");

// my code for finding a specific article
// app.get('/articles/:id', function(req, res) {
// 	var id = req.params.id;
// 	db.Article.find(id).then(function(dbArticle) {
// 		res.render('/articles/article', {articleToDisplay: dbArticle});
// 	});
//   res.send("Set up a response for this route!"); 
// });

// answer code:

app.get('/articles/:id', function(req, res) {
  db.Article.find({ where: { id: req.params.id }, include: db.Author })
  	.then(function(dbArticle) {
  		res.render('articles/article', { articleToDisplay: dbArticle });
  	});
  
});

// Fill in these author routes!

// since this is a one:many, authors is our one and articles will be the many attached 
// to the authors 
app.get('/authors', function(req, res) {
	// going to grab all the authors in the author db, then the promise will take us
	//into a function of the DB for authors that will rendor or show the authors/index
	//route which will show the dbAuthors on the index.ejs identified by the ejsAuthors
	db.Author.all().then(function(dbAuthors) {
		res.render('authors/index', { ejsAuthors: dbAuthors} );
	});	
});

app.get('/authors/new', function(req, res) {
	res.render('authors/new');
});

app.post('/authors', function(req, res) {
	db.Author
		.create(req.body.author)
		.then(function(dbAuthor) {
			res.redirect('/authors');
		});
});
	// my code; basically going to store the request of the body for author
	// into the variable author, then create in the db of author a new author in the 
	// author body and then have that newly created author redirect back to the
	// /authors route
	// my answer:
	// var author = req.body.author;
	// db.Author.create(req.body.author).then(function(dbAuthor) {
	// 		res.redirect('/authors');
	// 	});

	// answer:
	

// my answer:
// so we have a method that is going to route to the specific id of an author, 
// and then we are going to impelement a function where we are grabbing or requesting
// the specific ID of the author and storing it into a variable id

//app.get('/authors/:id', function(req,res) {
// 	var id = req.params.id;
// 	// now we are going to find the author with a specific id, then the promise will
// 	//produce a function that will show the author that is routed to the author ejs. 
// 	db.Author.find(id).then(function(dbArticle) {
// 		res.render('authors/author', {ejsAuthor: dbAuthor});
// 	});
// 	console.log("GET /authors/:id")
// 	res.send("Set up a response for this route!");
// });

//answer:

app.get('/authors/:id', function(req, res) {
	db.Author
		.find({ where: {id: req.params.id}, include: db.Article })
		.then(function(dbAuthor) {
			res.render('authors/author', { ejsAuthor: dbAuthor })
		})
});

//Site related routes

app.get('/', function(req,res) {
  res.render('site/index.ejs');
});

app.get('/about', function(req,res) {
  res.render('site/about');
});

app.get('/contact', function(req,res) {
  res.render('site/contact');
});

// not sure why this is here - it is in answers and I missed this step entirely. 
// looks like we have to actually have a method to route to the sync for the sequelize

app.get('/sync', function(req, res) {
	db.sequelize.sync().then(function() {
		res.send("Sequelize Synchronization is Complete!");
	})
});

app.listen(3000, function() {
	var msg = "* Listening on Port 3000 *";

	// Just for fun... what's going on in this code?
	/*
	 * When the server starts listening, it displays:
	 *
	 * 	**************************
	 *	* Listening on Port 3000 *
	 *	**************************
	 *
	*/
	console.log(Array(msg.length + 1).join("*"));
	console.log(msg);
	console.log(Array(msg.length + 1).join("*"));
});
