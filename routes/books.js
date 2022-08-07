const express = require("express");
const Book = require("../models/book");
const router = express.Router();
const {body,query,param,validationResult} = require('express-validator');
// const { nanoid } = require("nanoid");

// const idLength = 8;

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *         genre:
 *           type: array
 *           description: An array of the book genre
 *         publisher:
 *           type: string
 *           description: The book publisher
 *         pages:
 *           type: number
 *           description: The number of pages
 *         publish_year:
 *           type: number
 *           description: The year published
 *         cover_image:
 *           type: string
 *           description: The cover image link/url
 *       example:
 *         title: The New Turing Omnibus
 *         author: Alexander K. Dewdney
 *         genre: ['romance','comedy']
 *         publisher: Ervil Writes
 *         pages: 99
 *         publish_year: 1974
 *         cover_image: https://covers.com/image.jpg
 */

 /**
  * @swagger
  * tags:
  *   name: Books
  *   description: The books managing API
  */


//Route get '/'
//documentation
/**
 * @swagger
 * /books:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: The book title
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: The book author
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: The book genre
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

//logic
router.get("/", async(req, res) => {
    let condition = {};
    for(let param in req.query){
        if(param=="genre")condition[param] = req.query[param];
        else condition[param] = new RegExp(`.*${req.query[param]}.*`,"i");
    }
    console.log(condition); 
    try {
        const books = await Book.find(condition);
        res.send(books);
    } catch (error) {
        throw error;
    }
});

// Route get '/:id
//validation
router.use('/:id',
    param('id').isAlphanumeric().notEmpty().isLength({min:24}).withMessage("Invalid id"),
    (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send(errors);
    }
    else{
      next();
    }
  });
//Documentation
/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book description by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found
 */
//logic
router.get("/:id", async(req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if(!book){res.sendStatus(404);}
        res.send(book);
    } catch (error) {
        throw error;
    }	
});



//Route put "/id"
// Validation
router.use('/:id',
    param('id').isAlphanumeric().isLength({min:24}).withMessage("Invalid id"),
    body('title').optional({nullable: true, checkFalsy: true}).isString().trim().escape(),
    body('author').optional({nullable: true, checkFalsy: true}).isString().trim().escape(),
    body('genre','Must be an array').optional({nullable: true, checkFalsy: true}).isArray(),
    body('publisher').optional({nullable: true, checkFalsy: true}).isString().trim().escape(),
    body('pages').optional({nullable: true, checkFalsy: true}).isNumeric(),
    body('publish_year').optional({nullable: true, checkFalsy: true})
      .isNumeric().isLength({min:4,max:4}).withMessage('Invalid year'),
    body('cover_image').optional({nullable: true, checkFalsy: true}).isURL(),
    (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send(errors);
    }
    else{
      next();
    }
  });
//documentation
/**
 * @swagger
 * /books/{id}:
 *  put:
 *    summary: Update the book by the id
 *    tags: [Books]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The book id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Book'
 *    responses:
 *      200:
 *        description: The book was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'
 *      404:
 *        description: The book was not found
 *      500:
 *        description: Some error happened
 */
//logic
router.put("/:id", async(req, res) => {
	try {
        if('cover_image' in req.body){
          const imgExt = req.body.cover_image.split('.').pop();
          const extns = ['jpg','jpeg','png','gif'];
          if(extns.indexOf(imgExt.toLowerCase())==-1){
            return res.status(200).send({
              'msg':'Invalid image url',
              'value':'cover_image'
            });
          };
        }
        req.body['modified'] = Date.now();
        let book = await Book.findByIdAndUpdate(req.params.id,req.body);
        if(!book) return res.sendStatus(404);
        book.save();
        res.send(await Book.findById(req.params.id));
	} catch (error) {
		throw error;
	}
});


/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Remove the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 * 
 *     responses:
 *       200:
 *         description: The book was deleted
 *       404:
 *         description: The book was not found
 */

 router.delete("/:id", async(req, res) => {
    const book = await Book.findByIdAndDelete(req.params.id);
    console.log(book);
    if(!book) return res.sendStatus(404);
    return res.send(book);
});


//Route post '/'
//validation
router.use('/',
    body('title','Title is required').isString().trim().notEmpty().escape(),
    body('author','Author is required').isString().trim().notEmpty().escape(),
    body('genre','Must be an array').optional({nullable: true, checkFalsy: true}).isArray(),
    body('publisher').optional({nullable: true, checkFalsy: true}).isString().trim().escape(),
    body('pages').optional({nullable: true, checkFalsy: true}).isNumeric(),
    body('publish_year').optional({nullable: true, checkFalsy: true})
      .isNumeric().isLength({min:4,max:4}).withMessage('Invalid year'),
    body('cover_image').optional({nullable: true, checkFalsy: true}).isURL(),
    (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send(errors);
    }
    else{
      next();
    }
  });
//documentation
/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       500:
 *         description: Some server error
 */
//logic
router.post("/", (req, res) => {
	try {
        if('cover_image' in req.body){
          const imgExt = req.body.cover_image.split('.').pop();
          const extns = ['jpg','jpeg','png','gif'];
          console.log(imgExt);
          if(extns.indexOf(imgExt.toLowerCase())==-1){
            return res.status(200).send({
              'msg':'Invalid image url',
              'value':'cover_image'
            });
          };
        }
        const book = new Book({...req.body,});
        book.save();
        res.send(book)
	} catch (error) {
		return res.status(500).send(error);
	}
});

module.exports = router;
