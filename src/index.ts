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
