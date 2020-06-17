import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
sqlite3.verbose();

const DB_SOURCE = 'db.sqlite';

export async function openDb() {
  return open({
    filename: DB_SOURCE,
    driver: sqlite3.Database,
  });
}
