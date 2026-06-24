import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

function getFilePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function loadCollection(name) {
  const fp = getFilePath(name);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return []; }
}

function saveCollection(name, data) {
  fs.writeFileSync(getFilePath(name), JSON.stringify(data, null, 2), 'utf8');
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function matchFilter(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      for (const [op, opVal] of Object.entries(val)) {
        if (op === '$in') {
          if (!opVal.includes(doc[key])) return false;
        } else if (op === '$regex') {
          if (!new RegExp(opVal, val.$options || '').test(doc[key] || '')) return false;
        } else if (op === '$ne') {
          if (doc[key] === opVal) return false;
        }
      }
    } else {
      if (doc[key] !== val) return false;
    }
  }
  return true;
}

// --- Collection class ---
export class Collection {
  constructor(name) {
    this.name = name;
  }
  _all() { return loadCollection(this.name); }
  _save(data) { saveCollection(this.name, data); }

  find(filter = {}) { return new Query(this, filter); }

  findById(id) {
    const d = this._all().find(x => x._id === id);
    return new Query(this, { _id: id })._wrapSingle(d ? clone(d) : null);
  }

  findOne(filter) {
    const d = this._all().find(x => matchFilter(x, filter));
    return new Query(this, filter)._wrapSingle(d ? clone(d) : null);
  }

  create(doc) {
    const all = this._all();
    const nd = { _id: generateId(), ...clone(doc), createdAt: new Date().toISOString() };
    all.push(nd);
    this._save(all);
    return clone(nd);
  }

  insertMany(docs) {
    const all = this._all();
    const now = new Date().toISOString();
    const inserted = docs.map(d => ({ _id: generateId(), ...clone(d), createdAt: now }));
    all.push(...inserted);
    this._save(all);
    return clone(inserted);
  }

  findByIdAndDelete(id) {
    const all = this._all();
    const idx = all.findIndex(d => d._id === id);
    if (idx === -1) return null;
    all.splice(idx, 1);
    this._save(all);
    return { _id: id };
  }

  findOneAndDelete(filter) {
    const all = this._all();
    const idx = all.findIndex(d => matchFilter(d, filter));
    if (idx === -1) return null;
    all.splice(idx, 1);
    this._save(all);
    return { message: 'deleted' };
  }

  findByIdAndUpdate(id, update) {
    const all = this._all();
    const idx = all.findIndex(d => d._id === id);
    if (idx === -1) return null;
    all[idx] = applyUpdate(all[idx], update);
    all[idx].updatedAt = new Date().toISOString();
    this._save(all);
    return clone(all[idx]);
  }

  findOneAndUpdate(filter, update, options = {}) {
    const all = this._all();
    const idx = all.findIndex(d => matchFilter(d, filter));
    if (idx === -1) {
      if (options.upsert) {
        const nd = { _id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        if (update.$set) Object.assign(nd, clone(update.$set));
        if (update.$inc) {
          for (const [k, v] of Object.entries(update.$inc)) nd[k] = (nd[k] || 0) + v;
        }
        all.push(nd);
        this._save(all);
        return clone(nd);
      }
      return null;
    }
    all[idx] = applyUpdate(all[idx], update);
    all[idx].updatedAt = new Date().toISOString();
    this._save(all);
    return clone(all[idx]);
  }

  deleteMany(filter) {
    const all = this._all();
    const remaining = all.filter(d => !matchFilter(d, filter));
    const deletedCount = all.length - remaining.length;
    this._save(remaining);
    return { deletedCount };
  }

  countDocuments(filter = {}) {
    return this._all().filter(d => matchFilter(d, filter)).length;
  }

  aggregate(pipeline) {
    let data = this._all();
    for (const stage of pipeline) {
      if (stage.$match) {
        data = data.filter(d => matchFilter(d, stage.$match));
      } else if (stage.$sample) {
        const size = Math.min(stage.$sample.size, data.length);
        data = [...data].sort(() => Math.random() - 0.5).slice(0, size);
      }
    }
    return clone(data);
  }
}

function applyUpdate(doc, update) {
  const r = clone(doc);
  if (update.$set) Object.assign(r, clone(update.$set));
  if (update.$inc) {
    for (const [k, v] of Object.entries(update.$inc)) {
      r[k] = (r[k] || 0) + v;
    }
  }
  return r;
}

// --- Query class ---
class Query {
  constructor(collection, filter) {
    this._collection = collection;
    this._filter = filter || {};
    this._sortObj = null;
    this._skipVal = 0;
    this._limitVal = null;
    this._selectStr = null;
    this._populateObj = null;
    this._refs = {};
    this._singleResult = null;
    this._isSingle = false;
  }

  _wrapSingle(result) {
    this._isSingle = true;
    this._singleResult = result;
    return this;
  }

  sort(obj) { this._sortObj = obj; return this; }
  skip(n) { this._skipVal = n; return this; }
  limit(n) { this._limitVal = n; return this; }
  select(str) {
    this._selectStr = str;
    return this;
  }
  populate(arg) {
    if (typeof arg === 'string') {
      this._populateObj = { path: arg, select: '' };
    } else if (arg && typeof arg === 'object') {
      this._populateObj = arg;
    }
    return this;
  }
  setRefs(refs) { this._refs = refs; return this; }

  _exec() {
    if (this._isSingle) {
      return this._populateDoc(this._singleResult);
    }

    let data = this._collection._all().filter(d => matchFilter(d, this._filter));
    data = data.map(d => clone(d));

    if (this._sortObj) {
      const keys = Object.keys(this._sortObj);
      data.sort((a, b) => {
        for (const k of keys) {
          const dir = this._sortObj[k];
          if ((a[k]||'') < (b[k]||'')) return -dir;
          if ((a[k]||'') > (b[k]||'')) return dir;
        }
        return 0;
      });
    }
    if (this._skipVal) data = data.slice(this._skipVal);
    if (this._limitVal) data = data.slice(0, this._limitVal);
    data = data.map(d => this._populateDoc(d));
    data = data.map(d => this._applySelect(d));
    return data;
  }

  _populateDoc(doc) {
    if (!doc || !this._populateObj) return doc;
    const { path: popPath, select: popSelect } = this._populateObj;
    const refName = this._refs[popPath];
    if (!refName) return doc;
    const refCol = new Collection(refName);
    const d = clone(doc);
    if (Array.isArray(d[popPath])) {
      d[popPath] = d[popPath].map(id => {
        let ref = refCol.findById(id);
        if (ref && ref.then) {
          // handle synchronous flow
          const r = refCol._all().find(x => x._id === id);
          ref = r ? clone(r) : null;
        }
        if (ref && popSelect) {
          ref = applySelectToDoc(ref, popSelect);
        }
        return ref;
      }).filter(Boolean);
    } else if (d[popPath]) {
      let ref = refCol.findById(d[popPath]);
      d[popPath] = ref;
    }
    return d;
  }

  _applySelect(doc) {
    if (!doc || !this._selectStr) return doc;
    return applySelectToDoc(doc, this._selectStr);
  }

  then(resolve, reject) {
    try {
      const r = this._exec();
      resolve(r);
    } catch (e) { reject(e); }
  }

  catch(reject) {
    try { this._exec(); } catch (e) { reject(e); }
  }
}

function applySelectToDoc(doc, selectStr) {
  if (!selectStr) return doc;
  const d = clone(doc);
  const parts = selectStr.split(/\s+/);
  for (const p of parts) {
    if (p.startsWith('-')) {
      delete d[p.slice(1)];
    }
  }
  if (parts.some(p => !p.startsWith('-'))) {
    const keep = {};
    for (const p of parts) {
      if (!p.startsWith('-') && d[p] !== undefined) keep[p] = d[p];
    }
    keep._id = d._id;
    return keep;
  }
  return d;
}

// --- createModel ---
export function createModel(collectionName, refs = {}) {
  const col = new Collection(collectionName);
  const handler = {
    get(target, prop) {
      if (prop === '_collection') return col;
      if (typeof col[prop] === 'function') {
        return function(...args) {
          const result = col[prop](...args);
          if (result instanceof Query) {
            result.setRefs(refs);
            return result;
          }
          return result;
        };
      }
      return col[prop];
    }
  };
  return new Proxy(function(){}, handler);
}
