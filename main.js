import dotenv from 'dotenv'
dotenv.config();
import sqlite3 from "sqlite3"
import path from "path"
import { stat, mkdir, copyFile } from "fs"

const umamusumePath = process.env.UMAMUSUME_PATH
const exportPath = process.env.EXPORT_PATH || './result'

(async () => {
  const metaDbPath = `${umamusumePath}/meta`
  if (!await existsFile(metaDbPath)) throw new Error('not exists meta')
  
  const metaDb = new sqlite3.Database(metaDbPath)
  metaDb.each('select * from a where m not like "manifest%"', async (err, row) => {
    if (err) throw err
    const meta = new Meta(row.n, row.h, row.m)
    
    const hashFullPath = `${umamusumePath}/dat/${meta.hashFullPath}`
    if (!await existsFile(hashFullPath)) return console.error(`not found ${hashFullPath}`)
  
    const dest = `${exportPath}/${meta.fullPath}`
    if (await existsFile(dest)) return console.log(`already exists so skip ${dest}`)
    await makeDir(`${exportPath}/${meta.dirName}`, {recursive: true})
    await cpFile(hashFullPath, dest)
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

function existsFile(path) {
  return new Promise((resolve, reject) => {
    stat(path, (err, stats) => {
      return resolve(!err)
    })
  })
}

function makeDir(path, option) {
  return new Promise((resolve, reject) => {
    mkdir(path, option, (err) => {
      if (err) return reject(err)
      return resolve()
    })
  })
}

function cpFile(src, dest) {
  return new Promise((resolve, reject) => {
    copyFile(src, dest, (err) => {
      if (err) return reject(err)
      return resolve()
    })
  })
}
