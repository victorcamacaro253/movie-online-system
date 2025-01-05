import { Router } from "express";
import Movies from "../controllers/movies.js";
import upload from "../middleware/multerConfig.js";

const router = Router()


router.get('/',Movies.getAllMovies)


router.get('/playing',Movies.getMoviesCurrentlyPlaying)


router.get('/movie/:title',Movies.getMovieByTitle)


router.get('/genre',Movies.getMoviesByGenre)


router.get('/actor/:name',Movies.getMoviesByActorName)


router.get('/actors/:id',Movies.getMoviesByActor)


router.get("/countByGenre",Movies.countMoviesByGenre);


router.get('/d/',Movies.getMoviesByYear)


router.get('/date',Movies.getMoviesByDateRange)


router.get('/:id',Movies.getMovieById)


router.put('/:id',Movies.updateMovie)


router.put('/status/:id',Movies.updateStatus)


router.post('/',upload.single('poster'),Movies.addMovie)


router.post('/addMultipleMovies',upload.array('poster'),Movies.addMultipleMovies)


router.delete('/:id',Movies.deleteMovie)


export default router