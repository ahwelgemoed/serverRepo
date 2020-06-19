import io from 'socket.io';
import { openDb } from './db';

const port = 8080;
const ws = io(port);
const liveUpdateNameSpace = ws.of('/liveUpdates');

interface IncomingData {
  sensor?: string;
  data: Data;
}
interface Data {
  temperature: number;
  humidity: number;
}

ws.on('connection', (socket) => {
  socket.on('oneMinuteData', (data) => {
    if (typeof data.data === 'string') {
      const parseData: Data = JSON.parse(data.data);
      console.log('parseData', parseData);
      saveDataToDB(parseData);
    }
  });
});

liveUpdateNameSpace.on('connection', (socket) => {
  /**
   *  client send openLiveFeed to this server this server ends out TURNON change this to broadcast message
   */
  socket.on('openLiveFeed', () => {
    liveUpdateNameSpace.emit('TURNON');
  });
  socket.on('closeLiveFeed', () => {
    liveUpdateNameSpace.emit('TURNOFF');
  });

  console.log('someone connected' + ' 🔥');
  socket.on('liveUpdateNameSpace', (data) => {
    console.log(data);
  });
});

liveUpdateNameSpace.on('disconnect', () => {
  console.log('disconnect');
  liveUpdateNameSpace.emit('TURNOFF');
});

setTimeout(() => {
  liveUpdateNameSpace.emit('TURNON', { refreshRate: 500 });
}, 5000);

// setTimeout(() => {
//   liveUpdateNameSpace.emit('TURNOFF');
// }, 15000);

/**
 * SAVE DATA
 */

const saveDataToDB = async (data: Data) => {
  // console.log('data', data);
  const db = await openDb();

  try {
    await db.exec(
      'CREATE TABLE weather_data (id INTEGER PRIMARY KEY, temperature VARCHAR(25) NOT NULL, humidity VARCHAR(25) NOT NULL, date DATE)'
    );
    await insertData(data);
  } catch (error) {
    await insertData(data);
  }
};

const insertData = async ({ temperature, humidity }: Data) => {
  try {
    const db = await openDb();
    await db.exec(
      `INSERT INTO weather_data VALUES (${null}, ${temperature},${humidity},DATETIME('now'))`
    );
  } catch (error) {
    console.log('error', error);
  }
};
