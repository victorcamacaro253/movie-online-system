import Movie from '../models/movies.js'
import Actor from '../models/actors.js'

class Movies {
    
  static async getAllMovies(req, res) {
    try {
      const movies = await Movie.find().populate("cast","name image");
    //  console.log("Fetched Movies:", movies); // Log fetched movies

      if (movies.length === 0) {
        return res.status(404).json({ message: "No movies found" });
      }
      res.json(movies);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching movies" });
    }
  }


   static async getMovieByTitle(req,res){
    const {title} = req.params;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    
    try{
     
      const movie = await Movie.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } }).populate("cast","name image");

      if(!movie){
        return res.status(404).json({message:"Movie not found"});
        }
        res.json(movie);
        }catch(error){
          console.log(error);
          res.status(500).json({message:"Error fetching movie"});
          }
          
   }

   static async getMoviesByYear(req, res) {
    const { date } = req.query;
  
    if (!date || date.trim() === "") {
      return res.status(400).json({ message: "Date is required" });
    }
  
    try {
      // Crear un rango de fechas para el año especificado
      const startDate = new Date(`${date}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${date}-12-31T23:59:59.999Z`);
  
      // Buscar películas dentro del rango
      const movies = await Movie.find({
        release_date: { $gte: startDate, $lte: endDate },
      }).populate("cast","name image");
  
      if (!movies || movies.length === 0) {
        return res.status(404).json({ message: "No movies found for the given date" });
      }
  
      const total_movies = movies.length

      res.json({movies,
        total_movies
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching movies" });
    }
  }
  

 static async getMoviesByGenre(req, res) {
  const { genre } = req.query;
  try{
    const movies = await Movie.find({ genre:  { $regex: new RegExp(`^${genre}$`, 'i') } }).populate("cast","name image");
    if(!movies || movies.length === 0){
      return res.status(404).json({message:"No movies found for the given genre"});
      }

     const total_movies= movies.length;
      res.json({
        movies
        ,total_movies});
      
      }catch(error){
        console.log(error);
        res.status(500).json({message:"Error fetching movies"});
        }
        
  }

  static async getMoviesCurrentlyPlaying(req,res){
    try{
      const movies = await Movie.find({status: "playing"}).populate("cast","name image");
      if(!movies || movies.length === 0){
        return res.status(404).json({message:"No movies found for the given date"});
        }

        const total_movies= movies.length;

        res.json({movies,
          total_movies});

        }catch(error){
          console.log(error);
          res.status(500).json({message:"Error fetching movies"});
          }


  }


  static async countMoviesByGenre(req,res){
    try {
      const genreCounts= await Movie.aggregate([
        {
          $unwind:"$genre"
        },
        {
          $group:{
            _id:"$genre",
            total_movies:{$sum:1}
        }
      },
      {
        $sort:{total_movies:-1}
      }
      ])

      if (!genreCounts || genreCounts.length === 0) {
        return res.status(404).json({ message: "No movies found" });
      }

      res.json(genreCounts)
    } catch (error) {
      
    }
  }


  static async getMovieById(req,res){
    const {id}= req.params
    try {
      const movie = await Movie.findById(id).populate("cast","name image");

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
        }
        res.json(movie);

        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Error fetching movie" });
          }

  }


  static async getMoviesByActor(req,res){
    const {id}= req.params
    try {
      const movies = await Movie.find({$or:[{cast:id},{director:id}]}).populate("cast","name image");
      if (!movies || movies.length === 0) {
        return res.status(404).json({ message: "No movies found" });
        }

        const total_movies= movies.length


        res.json({
          movies,
          total_movies
        })


        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Error fetching movies" });
          }
  }
          
  static async getMoviesByActorName(req, res) {
    const { name } = req.params;
  
    try {
      // Step 1: Find the actor(s) by name
      const actors = await Actor.find({ name: new RegExp(name, "i") }); // Case-insensitive match
      if (!actors || actors.length === 0) {
        return res.status(404).json({ message: "No actors found with this name" });
      }
  
      // Step 2: Get the actor IDs
      const actorIds = actors.map((actor) => actor._id);
  
      // Step 3: Find movies where the actor is in the cast or is the director
      const movies = await Movie.find({
        $or: [{ cast: { $in: actorIds } }, { director: { $in: actorIds } }],
      }).populate("cast", "name image").select("title genre release_date bookings_count").populate("director", "name image");
  
      if (!movies || movies.length === 0) {
        return res.status(404).json({ message: "No movies found for this actor" });
      }
  
      const total_movies= movies.length
      // Step 4: Return the movies
      res.json({movies,
        total_movies});

      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching movies" });
    }
  }
  
  static async getMoviesByDateRange(req,res){
    try {
      const {startDate,endDate}= req.query

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      
      const movies = await Movie.find({
        release_date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
          }
          }).populate("cast","name image");

       if (!movies || movies.length === 0) {
      return res.status(404).json({ message: "No movies found in the specified date range" });
      }


       res.json({ movies, totalMovies: movies.length });

         } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error fetching movies" });
            }

  }


  static async addMovie(req, res) {
    try {
      const {
        title,
        description,
        genre,
        director,
        producers,
        cast,
        runtime,
        language,
        rating,
        ageRating,
        release_date,
        trailer,
        poster,
        country,
        status,
      } = req.body;
  
      // Validate required fields
      if (
        !title ||
        !description ||
        !genre ||
        !director ||
        !producers ||
        !cast ||
        !runtime ||
        !language ||
        !rating ||
        !ageRating ||
        !release_date ||
        !country ||
        !status
      ) {
        return res.status(400).json({
          error: "All required fields must be provided.",
        });
      }
  

      const existingMovie = await Movie.findOne({title})

      if(existingMovie){
        return res.status(400).json({error: "Movie already exists"})
      }
      // Validate arrays
     /* if (!Array.isArray(genre) || !Array.isArray(producers) || !Array.isArray(cast)) {
        return res.status(400).json({
          error: "Genre, producers, and cast must be arrays.",
        });
      }*/
  
      // Create a new movie document
      const newMovie = new Movie({
        title,
        description,
        genre,
        director,
        producers,
        cast,
        runtime,
        language,
        rating,
        ageRating,
        release_date,
        trailer,
        poster,
        country,
        status,
      });
  
      // Save the movie to the database
      const savedMovie = await newMovie.save();
  
      res.status(201).json(savedMovie);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error adding the movie." });
    }
  }

/*
  static async addMultipleMovies(req, res) {
    try {
      const { movies } = req.body;
  
      if (!movies || !Array.isArray(movies)) {
        return res.status(400).json({
          error: "An array of movies must be provided.",
        });
      }
  
      // Check for existing movies
      const existingMovies = await Movie.find({
        title: { $in: movies.map((movie) => movie.title) },
      });
  
      const existingTitles = existingMovies.map((movie) => movie.title);
  
      // Filter out duplicates
      const uniqueMovies = movies.filter(
        (movie) => !existingTitles.includes(movie.title)
      );
  
      // Insert unique movies into the database
      let insertedMovies = [];
      if (uniqueMovies.length > 0) {
        insertedMovies = await Movie.insertMany(uniqueMovies, {
          ordered: false, // Continue even if some fail
        });
      }
  
      // Respond with success and details
      res.status(200).json({
        message: "Movies processed successfully.",
        insertedMovies,
        skippedMovies: existingTitles,
      });
    } catch (error) {
      console.error(error);
  
      // Handle specific MongoDB write errors
      if (error.writeErrors) {
        const failedMovies = error.writeErrors.map((err) => err.err.op.title);
        return res.status(207).json({
          message: "Partial success. Some movies could not be added.",
          insertedMovies,
          failedMovies,
        });
      }
  
      res.status(500).json({ error: "Error adding the movies." });
    }
  }
  */
  static async addMultipleMovies(req, res) {
    try {
      const { movies } = req.body;
  
      if (!movies || !Array.isArray(movies)) {
        return res.status(400).json({
          error: "An array of movies must be provided.",
        });
      }
  
      // Check for existing movies using unique identifiers
      const existingMovies = await Movie.find({
        title: { $in: movies.map((movie) => movie.title) },
      });
  
      const existingTitles = existingMovies.map((movie) => movie.title);
  
      // Filter out duplicates
      const uniqueMovies = movies.filter(
        (movie) => !existingTitles.includes(movie.title)
      );
  
      
      // Validate movie data (optional)
      // Add validation logic here if needed
  
      // Insert unique movies into the database
      let insertedMovies = [];
      if (uniqueMovies.length > 0) {
        insertedMovies = await Movie.insertMany(uniqueMovies, {
          ordered: false,
        });
      }
  
      // Respond with success and details
      res.status(200).json({
        message: "Movies processed successfully.",
        insertedCount: insertedMovies.length,
        skippedCount: existingTitles.length,
        insertedMovies,
        skippedMovies: existingTitles,
      });
    } catch (error) {
      console.error("Error adding movies:", error);
  
      if (error.writeErrors) {
        const failedMovies = error.writeErrors.map((err) => err.err.op.title);
        return res.status(207).json({
          message: "Partial success. Some movies could not be added.",
          insertedMovies,
          failedMovies,
        });
      }
  
      res.status(500).json({ error: "Error adding the movies." });
    }
  }
  

  static async updateMovie(req,res){
    try {
      const { id } = req.params; // Get the movie ID from the request params
      const updateData = req.body; // Get the updated data from the request body
  
      // Check if the movie exists in the database
      const movie = await Movie.findById(id);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found." });
      }
  
      // Validate arrays if present in the update data
      if (updateData.genre && !Array.isArray(updateData.genre)) {
        return res.status(400).json({ error: "Genre must be an array." });
      }
  
      if (updateData.producers && !Array.isArray(updateData.producers)) {
        return res.status(400).json({ error: "Producers must be an array." });
      }
  
      if (updateData.cast && !Array.isArray(updateData.cast)) {
        return res.status(400).json({ error: "Cast must be an array." });
      }
  
      // Filter out fields that are undefined or invalid
      const fieldsToUpdate = {};
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          fieldsToUpdate[key] = updateData[key];
        }
      });
  
      // Update the movie document with dynamic fields
      const updatedMovie = await Movie.findByIdAndUpdate(
        id,
        { $set: fieldsToUpdate }, // Update only the provided fields
        { new: true, runValidators: true } // Return the updated document and enforce schema validation
      );
  
      res.status(200).json(updatedMovie);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating the movie." });
    }
    
              
  }


  static async updateStatus(req,res){
    try {
      const { id } = req.params; 
      const { status } = req.body; 
      
      if (typeof status !== 'string') {
        return res.status(400).json({ error: "Status must be a string." });
        }

       

        const updatedMovie = await Movie.findByIdAndUpdate(id, { status }, { new: true });

        res.status(200).json(updatedMovie);

        } catch (error) {
          console.error(error);

          res.status(500).json({ error: "Error updating the movie status." });
          
          }

  }

  static async deleteMovie(req,res){
    try {
      const { id } = req.params; // Get the movie ID from the request params
      const movie = await Movie.findByIdAndDelete(id);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found." });
        }
        res.status(200).json({ message: "Movie deleted successfully." });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Error deleting the movie." });
          }
  }



}

export default Movies;
