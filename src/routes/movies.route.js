const Router = require('express')
const router = new Router()
const authMiddleware = require('../middleware/auth.middleWare')
const moviesController = require('../controlers/movies.Controler')
const multer = require('multer')
const path = require('path');

const upload = multer({
    dest: path.join(__dirname, '../../uploads/'),
    limits: {fileSize: '15mb'},
});

router.post('', authMiddleware, moviesController.postMovies)
router.get('', authMiddleware, moviesController.getMovies)
router.post('/import', authMiddleware, upload.single('file'), moviesController.importMovies)
router.get('/:movieId', authMiddleware, moviesController.getMovieById)
router.delete('/:movieId', authMiddleware, moviesController.deleteMovie)
router.delete('', authMiddleware, moviesController.deleteMovie)


module.exports = router

