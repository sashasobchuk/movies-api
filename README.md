Clone the project:

git clone https://github.com/your-username/movies-api.git

Install dependencies:

npm install

npm start


##Authentication:

###Registration:

POST /api/auth/registration

POST /api/auth/login

###Test the API:
send api with bearer token from login api

1. Get all movies:
GET /api/movies 
2. Get a movie by ID:
GET /api/movies/:movieId
3. Add a movie:
POST /api/movies
4. Delete a movie:
DELETE /api/movies/:movieId
5. Import movies from a CSV file:
POST /api/movies/import








