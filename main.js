import dotenv from 'dotenv'
dotenv.config();
import sqlite3 from "sqlite3"
import path from "path"
import { stat, mkdir, copyFile } from "fs/promises"

const umamusumePath = process.env.UMAMUSUME_PATH
const exportPath = process.env.EXPORT_PATH || './result'

console.log('start');
(async () => {
  const metaDbPath = `${umamusumePath}/meta`
  if (!await existsFile(metaDbPath)) throw new Error('not exists meta')

  const metaDb = new sqlite3.Database(metaDbPath)
  metaDb.each('select * from a where m not like "manifest%"', async (err, row) => {
    if (err) throw err
    const meta = new Meta(row.n, row.h, row.m)

    const hashFullPath = `${umamusumePath}/dat/${meta.hashFullPath}`
    if (!await existsFile(hashFullPath)) return console.error(`not found ${hashFullPath} so skip`)

    const dest = `${exportPath}/${meta.fullPath}`
    if (await existsFile(dest)) return console.log(`already exists so skip ${dest}`)
    await mkdir(`${exportPath}/${meta.dirName}`, { recursive: true })
    await copyFile(hashFullPath, dest)
    console.log(`${dest} was copyed`)
  })
})()

class Meta {
  constructor(n, h, m) {
    this.dirName = path.dirname(n)
    this.baseName = path.basename(n)
    this.fullPath = n
    this.hashDirName = h.slice(0, 2)
    this.hashFileName = h
    this.hashFullPath = `${this.hashDirName}/${this.hashFileName}`
    this.type = m
  }
}

async function existsFile(path) {
  let exists = true
  try {
    await stat(path)
  } catch (e) {
    exists = false
  }

  return exists
}
