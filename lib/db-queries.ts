import { turso } from "./db";

// 用户相关的数据库操作
export async function createUsersTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function createUser(email: string, name: string) {
  const result = await turso.execute({
    sql: "INSERT INTO users (email, name) VALUES (?, ?)",
    args: [email, name],
  });
  return result;
}

export async function getUsers() {
  const result = await turso.execute("SELECT * FROM users ORDER BY created_at DESC");
  return result.rows;
}

export async function getUserById(id: number) {
  const result = await turso.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [id],
  });
  return result.rows[0];
}

export async function updateUser(id: number, email: string, name: string) {
  const result = await turso.execute({
    sql: "UPDATE users SET email = ?, name = ? WHERE id = ?",
    args: [email, name, id],
  });
  return result;
}

export async function deleteUser(id: number) {
  const result = await turso.execute({
    sql: "DELETE FROM users WHERE id = ?",
    args: [id],
  });
  return result;
}

// 搜索历史表
export async function createSearchHistoryTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

export async function addSearchQuery(query: string, userId?: number) {
  const result = await turso.execute({
    sql: "INSERT INTO search_history (query, user_id) VALUES (?, ?)",
    args: [query, userId ?? null],
  });
  return result;
}

export async function getSearchHistory(limit: number = 10) {
  const result = await turso.execute({
    sql: "SELECT * FROM search_history ORDER BY created_at DESC LIMIT ?",
    args: [limit],
  });
  return result.rows;
}

// 初始化所有表
export async function initDatabase() {
  await createUsersTable();
  await createSearchHistoryTable();
  console.log("Database initialized successfully");
}
