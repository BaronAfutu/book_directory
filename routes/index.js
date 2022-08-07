var express = require('express');
var router = express.Router();
const Book = require("../models/book");
const {body,query,param,validationResult} = require('express-validator');
const urlMap = {'authors':'author','publishers':'publisher','years':'publish_year',}


//validations
router.use('/search/',
    query('searchVal').isString().notEmpty().isLength({min:2}).trim().escape(),
    (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send(errors);
    }
    else{
      next();
    }
  });

//routes

/* GET home page. */
router.get('/', async function(req, res) {
  try {
    const books = await Book.find();
    res.render('index', { title: 'Express',books: books, divs: [], divName:"" });
  } catch (error) {
      throw error;
  }
});

router.get('/search', async function(req,res){
  const {searchVal} = req.query;
  const condition = {
    $or: [
      {title: new RegExp(".*"+ searchVal +".*","i")},
      {author: new RegExp(".*"+ searchVal +".*","i")},
    ]
  }
  try {
    const books = await Book.find(condition);
    res.render('index', { title: 'Express',books: books, divs: '', divName:'' });
  } catch (error) {
    throw error;
  }
});

router.get('/genres/:index/', async function(req, res) {
  try {
    if(isNaN(parseInt(req.params.index))){return res.redirect('back');}

    const all = await Book.find().select('genre -_id');
    let unique  = {};
    for(let x of all){
      for(let y of x['genre']){
        unique[y]=y.toLowerCase();
      }
    }
    const uniqueArray = Object.values(unique).sort();
    const books = await Book.find({'genre':uniqueArray[parseInt(req.params.index)]});

    // res.send(uniqueArray);
    res.render('index', { title: 'Express',books: books, divs: uniqueArray, divName:'Genres' });
  } catch (error) {
      throw error;
  }
});

router.get('/recent/', async function(req, res) {
  let seventhDay = new Date();
  seventhDay.setDate(seventhDay.getDate()-7);
  try {
    const books = await Book.find({'time_added':{$gt:seventhDay}});

    res.render('index', { title: 'Express',books: books, divs: '', divName:'' });
  } catch (error) {
      throw error;
  }
});

router.get('/:sortBy/:index/', async function(req, res) {
  try {
    const paramVal = req.params.sortBy;
    if(!(paramVal in urlMap)){return res.redirect('/');}
    if(isNaN(parseInt(req.params.index))){return res.redirect('back');}
    const sortBy = urlMap[paramVal];

    const all = await Book.find().select(sortBy +' -_id');
    let unique  = {};
    for(let x of all){
      unique[x[sortBy]]=x[sortBy];
    }
    const uniqueArray = Object.values(unique).sort();
    let condition={};
    condition[sortBy] = uniqueArray[parseInt(req.params.index)];
    const books = await Book.find(condition);

    //res.send(all);
    res.render('index', { title: 'Express',books: books, divs: uniqueArray, divName:paramVal });
  } catch (error) {
      throw error;
  }
});

module.exports = router;
