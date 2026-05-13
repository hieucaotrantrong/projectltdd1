const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const saltRounds = 10;

// Thông tin admin mặc định - bạn có thể thay đổi ở đây
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

async function createAdmin() {
  // Kết nối MySQL
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'hieu@1010',
    database: 'food_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Kiểm tra xem email đã tồn tại chưa
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [adminData.email]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log(`User with email ${adminData.email} already exists.`);
      console.log(`Current info: ID=${existingUser.id}, Name=${existingUser.name}, Role=${existingUser.role}`);
      
      // Hash password mới
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
      
      // Cập nhật thông tin admin (bao gồm cả password)
      await pool.query(
        'UPDATE users SET name = ?, password = ?, role = ? WHERE email = ?',
        [adminData.name, hashedPassword, adminData.role, adminData.email]
      );
      
      console.log(` Admin account updated successfully!`);
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Role: ${adminData.role}`);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
      
      // Tạo admin mới
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [adminData.name, adminData.email, hashedPassword, adminData.role]
      );
      
      console.log(`✅ Admin account created successfully!`);
      console.log(`   ID: ${result.insertId}`);
      console.log(`   Name: ${adminData.name}`);
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Role: ${adminData.role}`);
    }
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    // Đóng kết nối
    await pool.end();
  }
}

// Chạy hàm
console.log('Creating admin account...');
createAdmin();
