import { NextResponse } from "next/server";
import { turso } from "@/lib/db";
import { initDatabase, createUser, getUsers } from "@/lib/db-queries";

export async function GET() {
  try {
    // 测试数据库连接
    const result = await turso.execute("SELECT 1 as test");

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: result.rows,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // 初始化数据库表
    await initDatabase();

    // 添加测试用户
    await createUser("test@example.com", "Test User");

    // 获取所有用户
    const users = await getUsers();

    return NextResponse.json({
      success: true,
      message: "Database initialized and test data created",
      users,
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database initialization failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
