const router = require("express").Router();
const query = require("../database");
const { checkAdmin } = require("../helpers");

// User, Movies get all
router.get("/get/all", async (req, res) => {
  try {
    const select = await query(`SELECT 
        m.name,
        m.release_date,
        m.release_month,
        m.release_year,
        m.duration_min,
        m.genre,
        m.description,
        ms.status,
        l.location,
        st.time
    FROM movies m
    JOIN movie_status ms on m.status = ms.id
    JOIN schedules s on m.id = s.movie_id
    JOIN locations l on s.location_id = l.id
    JOIN show_times st on s.time_id = st.id
    ORDER BY m.id asc;`);

    return res.status(200).send(select);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// Get query
router.get("/get", async (req, res) => {
  try {
    const { status, location, time } = req.query;
    let sql = `SELECT 
        m.name,
        m.release_date,
        m.release_month,
        m.release_year,
        m.duration_min,
        m.genre,
        m.description,
        ms.status,
        l.location,
        st.time
    FROM movies m
    JOIN movie_status ms on m.status = ms.id
    JOIN schedules s on m.id = s.movie_id
    JOIN locations l on s.location_id = l.id
    JOIN show_times st on s.time_id = st.id `;

    if (status && location && time) {
      const statusSplit = status.split("%").join(" ");
      const timeSplit = time.split("%").join(" ");
      sql += `WHERE ms.status = '${statusSplit}' AND l.location = '${location}' AND st.time = '${timeSplit}'`;
    } else if (status && location) {
      const statusSplit = status.split("%").join(" ");
      sql += `WHERE ms.status = '${statusSplit}' AND l.location = '${location}'`;
    } else if (location && time) {
      const timeSplit = time.split("%").join(" ");
      sql += `WHERE l.location = '${location}' AND st.time = '${timeSplit}'`;
    } else if (status && time) {
      const statusSplit = status.split("%").join(" ");
      const timeSplit = time.split("%").join(" ");
      sql += `WHERE ms.status = '${statusSplit}' AND st.time = '${timeSplit}'`;
    } else if (status) {
      const statusSplit = status.split("%").join(" ");
      sql += `WHERE ms.status = '${statusSplit}'`;
    } else if (location) {
      sql += `WHERE l.location = '${location}'`;
    } else if (time) {
      const timeSplit = time.split("%").join(" ");
      sql += `WHERE st.time = '${timeSplit}'`;
    }

    const response = await query(sql);
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// Add movies (Admin)
router.post("/add", checkAdmin, async (req, res) => {
  try {
    const {
      name,
      genre,
      release_date,
      release_month,
      release_year,
      duration_min,
      description,
    } = req.body;

    let sql = `INSERT INTO movies (name, genre, release_date, release_month, release_year, duration_min, description) VALUES ('${name}', '${genre}', ${release_date}, ${release_month}, ${release_year}, ${duration_min}, '${description}')`;
    const insert = await query(sql);
    return res.status(200).send({
      id: insert.insertId,
      name,
      genre,
      release_date,
      release_month,
      release_year,
      duration_min,
      description,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// Mengubah status movie
router.patch("/edit/:id", checkAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    await query(`UPDATE movies SET status = ${status} WHERE id = ${id}`);

    return res.status(200).send({
      id,
      message: "status has been changed.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// Menambahkan jadwal (add schedule)
router.patch("/set/:id", checkAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { location_id, time_id } = req.body;
    await query(
      `INSERT INTO schedules (movie_id, location_id, time_id) VALUES (${id}, ${location_id}, ${time_id})`
    );

    return res.status(200).send({
      id,
      message: "schedule has been added.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = router;
