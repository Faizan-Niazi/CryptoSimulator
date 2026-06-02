const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper to read JSON files
const readData = (filename) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (e) {
    return [];
  }
};

// Helper to write JSON files
const writeData = (filename, data) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Helper to mock Mongoose chainable queries (Thenables)
const mockQuery = (promiseOrValue) => {
  const queryObj = {
    select: function() { return queryObj; },
    sort: function() { return queryObj; },
    populate: function() { return queryObj; },
    then: function(resolve, reject) {
      Promise.resolve(promiseOrValue).then(resolve, reject);
    }
  };
  return queryObj;
};

// MOCK MONGOOSE SCHEMAS
const FallbackUser = {
  findOne: (query) => {
    const users = readData('users');
    const u = users.find(user => {
      if (query.$or) {
        return query.$or.some(q => (q.email && user.email === q.email) || (q.username && user.username === q.username));
      }
      return (query.email && user.email === query.email) || (query.username && user.username === query.username);
    });
    
    if (!u) return mockQuery(null);
    return mockQuery({
      ...u,
      matchPassword: async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
    });
  },
  create: async (data) => {
    const users = readData('users');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    const newUser = {
      _id: 'u_' + Math.random().toString(36).substring(2, 11),
      username: data.username,
      email: data.email,
      password: hashedPassword,
      createdAt: new Date()
    };
    users.push(newUser);
    writeData('users', users);
    
    return {
      ...newUser,
      matchPassword: async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
    };
  },
  findById: (id) => {
    const users = readData('users');
    const u = users.find(user => user._id === id.toString());
    if (!u) return mockQuery(null);
    return mockQuery({
      ...u,
      matchPassword: async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
    });
  }
};

const FallbackWallet = {
  findOne: (query) => {
    const wallets = readData('wallets');
    const wallet = wallets.find(w => w.user === query.user.toString());
    if (!wallet) return mockQuery(null);
    
    return mockQuery({
      ...wallet,
      save: async function() {
        const list = readData('wallets');
        const index = list.findIndex(w => w._id === this._id);
        if (index !== -1) {
          list[index].balance = this.balance;
          list[index].updatedAt = new Date();
          writeData('wallets', list);
        }
        return this;
      }
    });
  },
  create: async (data) => {
    const wallets = readData('wallets');
    const newWallet = {
      _id: 'w_' + Math.random().toString(36).substring(2, 11),
      user: data.user.toString(),
      balance: data.balance || 100000,
      updatedAt: new Date()
    };
    wallets.push(newWallet);
    writeData('wallets', wallets);
    return newWallet;
  }
};

const FallbackPortfolio = {
  find: (query) => {
    const items = readData('portfolio');
    const filtered = items.filter(item => item.user === query.user.toString());
    return mockQuery(filtered);
  },
  findOne: (query) => {
    const items = readData('portfolio');
    const item = items.find(i => i.user === query.user.toString() && i.coinId === query.coinId);
    if (!item) return mockQuery(null);
    
    return mockQuery({
      ...item,
      save: async function() {
        const list = readData('portfolio');
        const index = list.findIndex(i => i._id === this._id);
        if (index !== -1) {
          list[index].amount = this.amount;
          list[index].averageBuyPrice = this.averageBuyPrice;
          writeData('portfolio', list);
        }
        return this;
      }
    });
  },
  create: async (data) => {
    const list = readData('portfolio');
    const newItem = {
      _id: 'p_' + Math.random().toString(36).substring(2, 11),
      user: data.user.toString(),
      coinId: data.coinId,
      symbol: data.symbol,
      name: data.name,
      amount: data.amount,
      averageBuyPrice: data.averageBuyPrice
    };
    list.push(newItem);
    writeData('portfolio', list);
    return newItem;
  },
  deleteOne: async (query) => {
    let list = readData('portfolio');
    list = list.filter(item => item._id !== query._id);
    writeData('portfolio', list);
    return { deletedCount: 1 };
  }
};

const FallbackTransaction = {
  create: async (data) => {
    const list = readData('transactions');
    const newTx = {
      _id: 't_' + Math.random().toString(36).substring(2, 11),
      user: data.user.toString(),
      type: data.type,
      coinId: data.coinId,
      symbol: data.symbol,
      name: data.name,
      amount: data.amount,
      price: data.price,
      totalUsd: data.totalUsd,
      timestamp: new Date()
    };
    list.push(newTx);
    writeData('transactions', list);
    return newTx;
  },
  find: (query) => {
    const list = readData('transactions');
    const filtered = list.filter(t => t.user === query.user.toString());
    const sorted = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return mockQuery(sorted);
  }
};

module.exports = {
  FallbackUser,
  FallbackWallet,
  FallbackPortfolio,
  FallbackTransaction,
};
