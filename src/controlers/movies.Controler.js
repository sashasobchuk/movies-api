const {Movie} = require("../db");
const fs = require('fs')
const {Sequelize} = require('sequelize');

class MoviesController {

    static async findMoviesQuery(req) {
        const {actorName, movieName, sortBy} = req.query;
        const query = {};
        if (actorName) {
            query.where = {
                actors: {
                    [Sequelize.Op.like]: `%${actorName.toLowerCase()}%`,
                },
            };
        }
        if (movieName) {
            query.where = query.where ? {
                ...query.where,
                title: {[Sequelize.Op.like]: `%${movieName.toLowerCase()}%`}
            } : {title: {[Sequelize.Op.like]: `%${movieName.toLowerCase()}%`}};
        }
        if (sortBy === 'title') {
            query.order = [['title', 'ASC']];
        } else if (sortBy === '-title') {
            query.order = [['title', 'DESC']];
        }
        return query
    }

    async getMovieById(req, res) {
        try {
            const {movieId} = req.params;
            const movie = await Movie.findByPk(movieId);

            if (!movie) {
                return res.status(404).send('Movie not found');
            }
            return res.json(movie)
        } catch (error) {
            console.error(error);
            res.status(500).send('Error finding movie');
        }
    }

    async getMovies(req, res) {
        try {
            let movies;
            if (!req.query) {
                movies = await Movie.findAll()
                return res.json(movies);
            }
            const query = await MoviesController.findMoviesQuery(req);
            movies = await Movie.findAll(query)
            return res.json(movies);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error searching for movies');
        }
    }

    async importMovies(req, res) {
       try {
           const data = await fs.promises.readFile(req.file.path, 'utf8');
           const movies = data.split('\r\n\r\n\r\n')

           const promises = [];
           for (const movie of movies) {
               const [title, releaseYear, format, actors] = movie.split('\r\n');

               if (!title || !releaseYear || !format || !actors) {
                   console.log('Missing required fields in request body');
                   continue;
               }
               promises.push(Movie.create({
                   title,
                   releaseYear,
                   format,
                   actors: actors.split(', '),
               }));
           }

           const results = await Promise.all(promises);
           res.json(results);
       }catch (error){
           console.error('Error importing movies:', error);
           res.status(500).json({ message: 'Internal server error' });
       }

    }

    async postMovies(req, res) {
        try {
            const {title, releaseYear, format, actors} = req.body;

            if (!title || !releaseYear || !format || !actors) {
                return res.status(400).send('Missing required fields in request body');
            }

            const newMovie = await Movie.create({
                title,
                releaseYear,
                format,
                actors,
            });

            res.status(201).json(newMovie)
        } catch (error) {
            console.error(error);
            res.status(500).send('Error creating movie');
        }
    }

    async deleteMovie(req, res) {
        try {
            const {movieId} = req.params;
            const movie = await Movie.findByPk(movieId);

            if (!movie) {
                return res.status(404).send('Movie not found');
            }

            await movie.destroy();

            return res.json({
                success: true,
                message: `Фільм з ID ${movieId} успішно видалено`,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error finding movie');
        }
    }
}

module.exports = new MoviesController()