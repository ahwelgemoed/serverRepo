import WebSocket from 'ws';

import { openDb } from './db';

const wss = new WebSocket.Server({ port: 8080 });

interface IncomingData {
  temperature: number;
  humidity: number;
}

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    if (typeof message === 'string') {
      const parseData: IncomingData = JSON.parse(message.toString());
      console.log(parseData);
      saveDataToDB(parseData);
    }
  });
});

const saveDataToDB = async (data: IncomingData) => {
  const db = await openDb();
  try {
    await db.exec('CREATE TABLE weather_data (temp, humi)');
    await insertData(data);
  } catch (error) {
    await insertData(data);
  }
};

const insertData = async ({ temperature, humidity }: IncomingData) => {
  const db = await openDb();
  await db.exec(`INSERT INTO weather_data VALUES (${temperature},${humidity})`);
};

// // const DBSOURCE = 'db.sqlite';
// const c = async () => {
//   const db = await openDb();
//   console.log('b', db);
//   try {
//     await db.exec('CREATE TABLE tbl (col TEXT)');
//     await db.exec('INSERT INTO tbl VALUES ("test")');
//   } catch (error) {
//     await db.exec('INSERT INTO tbl VALUES ("test")');
//     // console.log('error', error);
//   }

//   const nn = await db.get('SELECT col FROM tbl WHERE col = ?', 'test');
//   console.log('nn', nn);
// };

// c();
