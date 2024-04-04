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
            query.order = [[Sequelize.col('title', { collate: 'utf8mb4_unicode_ci' }), 'ASC']];
        } else if (sortBy === '-title') {
            query.order = [[Sequelize.col('title', { collate: 'utf8mb4_unicode_ci' }), 'DESC']];
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

                const validationErrors = MoviesController.validateMovie({title, releaseYear, format, actors})
                if (validationErrors.length) {
                    console.log(`Missing required fields in movie: ${title}`);
                    continue
                }

                const transformedMovie = MoviesController.transformMoovie(req.body)
                promises.push(Movie.create({
                    title: transformedMovie.title,
                    releaseYear: transformedMovie.releaseYear,
                    format: transformedMovie.format,
                    actors: transformedMovie.format,
                }));
            }

            const results = await Promise.all(promises);
            res.json(results);
        } catch (error) {
            console.error('Error importing movies:', error);
            res.status(500).json({message: 'Internal server error'});
        }

    }

    static transformMoovie(body) {
        let {title, releaseYear, format, actors} = body;
        title = title.trim()
        if (typeof actors === 'string') {
            actors = actors.split(', ')
        }
        return {title, releaseYear, format, actors}
    }

    static validateMovie(body) {
        let errors = []
        const {title, releaseYear, format, actors} = body;

        if (!title || !releaseYear || !format || !actors) {
            errors.push({
                status: 400,
                message: 'Missing required fields in request body'
            })
        }

        if (!['VHS', 'DVD', 'Blu-ray'].includes(format)) {
            errors.push({
                status: 400,
                message: 'Invalid format. Supported formats: VHS, DVD, Blu-ray'
            })
        }

        if (!title.trim()) {
            errors.push({
                status: 400,
                message: 'Invalid title, title is empty'
            })
        }

        if (title.includes('-') || title.includes(',')) {
            errors.push({
                status: 400,
                message: 'Invalid title, include "-" or ","'
            })
        }

        if (releaseYear < 1850 || releaseYear > 2023) {
            errors.push({
                status: 400,
                message: 'Release year must be between 1850 and 2023.'
            })
        }

        return errors
    }

    async postMovies(req, res) {
        try {
            const validationErrors = MoviesController.validateMovie(req.body)
            if (validationErrors.length) {
                return res.status(400).send(validationErrors.map(err => err.message).join(', \n'));
            }

            const transformedMovie = MoviesController.transformMoovie(req.body)

            const {title, releaseYear, format, actors} = transformedMovie

            const newMovie = await Movie.create({
                title: title.trim(),
                releaseYear,
                format,
                actors,
            }, {});

            res.status(201).json(newMovie)
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).send('Movie with the same title already exists');
            }

            console.error(error);
            res.status(500).send('Error creating movie: ', error.message);
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