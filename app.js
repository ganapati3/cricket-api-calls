const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is starting at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

// GET PLAYERS DETAILS API

const convertDBObjectToResponse = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
    *
    FROM
    cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertDBObjectToResponse(eachPlayer))
  );
});

// ADD PLAYER DETAILS API
app.use(express.json());
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
    cricket_team 
    (player_name,jersey_number,role)
    VALUES (
       ' ${playerName}',
        ${jerseyNumber},
       ' ${role}'
        );`;
  const dbResponse = await db.run(addPlayerQuery);
  console.log(dbResponse.lastID);
  response.send("Player Added to Team");
});

// GET PLAYER DETAILS API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
    SELECT
    *
    FROM
    cricket_team
    WHERE
    player_id = ${playerId};`;
  let playersArray = await db.get(getPlayersQuery);
  playersArray = [playersArray];
  const player = playersArray.map((eachPlayer) =>
    convertDBObjectToResponse(eachPlayer)
  );
  response.send(player[0]);
});

// UPDATE PLAYER DETAILS API

app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    UPDATE 
    cricket_team 
    SET
    player_name = ' ${playerName}',
     jersey_number =   ${jerseyNumber},
     role =  ' ${role}'
    WHERE
    player_id = ${playerId};`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Details Updated");
});

// DELETE PLAYER DETAILS API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
    cricket_team
    WHERE
    player_id = ${playerId}`;
  const dbResponse = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
