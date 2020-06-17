const MongoClient = require('mongodb').MongoClient;
 
// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'mp_project';

const connect = async function() {
  let db = null, client;
  try {      
    client = await MongoClient.connect(url,{ useUnifiedTopology: true });
    db = client.db(dbName)
  } catch (e) {
      console.error(e);
      client.close();
  }
  return  db;
}

module.exports = connect;