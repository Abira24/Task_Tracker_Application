import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:SriLanka07@localhost:3306/salon_tasks";

async function main() {
  const pool = mysql.createPool({
    uri: DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    console.log("Creating tables...");

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS User (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        avatar VARCHAR(255) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Customer (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NULL,
        notes TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Service (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        duration INT NOT NULL,
        price FLOAT NOT NULL,
        category VARCHAR(100) NOT NULL,
        isActive TINYINT(1) NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Stylist (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NULL,
        color VARCHAR(50) NOT NULL DEFAULT '#8b5cf6',
        isActive TINYINT(1) NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Appointment (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        date DATETIME NOT NULL,
        startTime VARCHAR(10) NOT NULL,
        endTime VARCHAR(10) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
        notes TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        customerId VARCHAR(255) NOT NULL,
        serviceId VARCHAR(255) NOT NULL,
        stylistId VARCHAR(255) NOT NULL,
        userId VARCHAR(255) NULL,
        FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE,
        FOREIGN KEY (serviceId) REFERENCES Service(id) ON DELETE CASCADE,
        FOREIGN KEY (stylistId) REFERENCES Stylist(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Task (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        priority VARCHAR(50) NOT NULL DEFAULT 'medium',
        status VARCHAR(50) NOT NULL DEFAULT 'todo',
        dueDate DATETIME NULL,
        tags TEXT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        userId VARCHAR(255) NULL,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS InventoryItem (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        minStock INT NOT NULL DEFAULT 5,
        price FLOAT NOT NULL,
        supplier VARCHAR(255) NULL,
        lastOrdered DATETIME NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("Tables created successfully!");

    // Seed data
    console.log("Seeding data...");

    // Users (passwords hashed with bcryptjs)
    const users = [
      { id: "user_1", email: "admin@glamour.com", name: "Jane Doe", password: "admin123", role: "admin" },
      { id: "user_2", email: "stylist@glamour.com", name: "Emma Wilson", password: "stylist123", role: "stylist" },
    ];

    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await pool.execute(
        "INSERT IGNORE INTO User (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)",
        [u.id, u.email, u.name, hashedPassword, u.role]
      );
    }

    // Stylists
    const stylists = [
      { id: "stylist_1", name: "Emma Wilson", email: "emma@glamour.com", phone: "+1 (555) 111-1111", color: "#8b5cf6" },
      { id: "stylist_2", name: "James Brown", email: "james@glamour.com", phone: "+1 (555) 111-2222", color: "#0ea5e9" },
      { id: "stylist_3", name: "Sophia Lee", email: "sophia@glamour.com", phone: "+1 (555) 111-3333", color: "#ec4899" },
      { id: "stylist_4", name: "Mia Garcia", email: "mia@glamour.com", phone: "+1 (555) 111-4444", color: "#10b981" },
    ];

    for (const s of stylists) {
      await pool.execute(
        "INSERT IGNORE INTO Stylist (id, name, email, phone, color) VALUES (?, ?, ?, ?, ?)",
        [s.id, s.name, s.email, s.phone, s.color]
      );
    }

    // Customers
    const customers = [
      { id: "cust_1", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 (555) 123-4567" },
      { id: "cust_2", name: "Mike Chen", email: "mike@example.com", phone: "+1 (555) 234-5678" },
      { id: "cust_3", name: "Lisa Anderson", email: "lisa@example.com", phone: "+1 (555) 345-6789" },
      { id: "cust_4", name: "Tom Williams", email: "tom@example.com", phone: "+1 (555) 456-7890" },
      { id: "cust_5", name: "Anna Martinez", email: "anna@example.com", phone: "+1 (555) 567-8901" },
      { id: "cust_6", name: "Robert Kim", email: "robert@example.com", phone: "+1 (555) 678-9012" },
      { id: "cust_7", name: "Emily Davis", email: "emily@example.com", phone: "+1 (555) 789-0123" },
      { id: "cust_8", name: "David Lee", email: "david@example.com", phone: "+1 (555) 890-1234" },
    ];

    for (const c of customers) {
      await pool.execute(
        "INSERT IGNORE INTO Customer (id, name, email, phone) VALUES (?, ?, ?, ?)",
        [c.id, c.name, c.email, c.phone]
      );
    }

    // Services
    const services = [
      { id: "svc_1", name: "Hair Coloring", category: "Color", duration: 150, price: 180 },
      { id: "svc_2", name: "Haircut & Styling", category: "Cut", duration: 30, price: 45 },
      { id: "svc_3", name: "Full Makeover", category: "Beauty", duration: 180, price: 300 },
      { id: "svc_4", name: "Manicure & Pedicure", category: "Nails", duration: 75, price: 90 },
      { id: "svc_5", name: "Deep Conditioning", category: "Treatment", duration: 45, price: 65 },
      { id: "svc_6", name: "Beard Trim & Shave", category: "Grooming", duration: 45, price: 55 },
      { id: "svc_7", name: "Bridal Updo", category: "Special", duration: 90, price: 250 },
      { id: "svc_8", name: "Scalp Treatment", category: "Treatment", duration: 30, price: 40 },
    ];

    for (const svc of services) {
      await pool.execute(
        "INSERT IGNORE INTO Service (id, name, category, duration, price) VALUES (?, ?, ?, ?, ?)",
        [svc.id, svc.name, svc.category, svc.duration, svc.price]
      );
    }

    // Appointments
    const appointments = [
      { id: "apt_1", date: new Date(), startTime: "9:00 AM", endTime: "11:30 AM", status: "confirmed", customerId: "cust_1", serviceId: "svc_1", stylistId: "stylist_1" },
      { id: "apt_2", date: new Date(), startTime: "10:30 AM", endTime: "11:15 AM", status: "in-progress", customerId: "cust_2", serviceId: "svc_6", stylistId: "stylist_2" },
      { id: "apt_3", date: new Date(), startTime: "11:00 AM", endTime: "2:00 PM", status: "confirmed", customerId: "cust_3", serviceId: "svc_3", stylistId: "stylist_3" },
      { id: "apt_4", date: new Date(), startTime: "1:00 PM", endTime: "1:30 PM", status: "pending", customerId: "cust_4", serviceId: "svc_2", stylistId: "stylist_1" },
      { id: "apt_5", date: new Date(), startTime: "2:30 PM", endTime: "3:45 PM", status: "confirmed", customerId: "cust_5", serviceId: "svc_4", stylistId: "stylist_4" },
      { id: "apt_6", date: new Date(), startTime: "3:00 PM", endTime: "3:45 PM", status: "confirmed", customerId: "cust_6", serviceId: "svc_5", stylistId: "stylist_2" },
      { id: "apt_7", date: new Date(), startTime: "4:00 PM", endTime: "5:30 PM", status: "confirmed", customerId: "cust_7", serviceId: "svc_7", stylistId: "stylist_3" },
    ];

    for (const a of appointments) {
      await pool.execute(
        "INSERT IGNORE INTO Appointment (id, date, startTime, endTime, status, customerId, serviceId, stylistId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [a.id, a.date, a.startTime, a.endTime, a.status, a.customerId, a.serviceId, a.stylistId]
      );
    }

    // Tasks
    const tasks = [
      { id: "task_1", title: "Restock hair coloring supplies", description: "Order new batch of premium hair coloring kits from supplier", priority: "high", status: "todo", dueDate: new Date(), tags: JSON.stringify(["inventory", "urgent"]), userId: "user_1" },
      { id: "task_2", title: "Update service menu pricing", description: "Review and update all service prices for the new quarter", priority: "medium", status: "todo", dueDate: new Date(Date.now() + 86400000), tags: JSON.stringify(["admin"]), userId: "user_1" },
      { id: "task_3", title: "Schedule team training session", description: "Organize training for new coloring techniques", priority: "medium", status: "todo", dueDate: new Date(Date.now() + 86400000), tags: JSON.stringify(["training"]), userId: "user_1" },
      { id: "task_4", title: "Deep clean treatment rooms", description: "Schedule deep cleaning for all treatment rooms this weekend", priority: "low", status: "todo", dueDate: new Date(Date.now() + 3 * 86400000), tags: JSON.stringify(["maintenance"]), userId: "user_1" },
      { id: "task_5", title: "Prepare monthly revenue report", description: "Compile all financial data and create presentation", priority: "high", status: "in-progress", dueDate: new Date(), tags: JSON.stringify(["finance", "report"]), userId: "user_1" },
      { id: "task_6", title: "Renew salon insurance policy", description: "Contact insurance provider to renew annual policy", priority: "urgent", status: "in-progress", dueDate: new Date(), tags: JSON.stringify(["admin", "legal"]), userId: "user_1" },
      { id: "task_7", title: "Update Instagram content calendar", description: "Plan social media posts for next month", priority: "medium", status: "in-progress", dueDate: new Date(), tags: JSON.stringify(["marketing"]), userId: "user_1" },
      { id: "task_8", title: "Fix reception area lighting", description: "Replace broken fluorescent lights in the reception area", priority: "low", status: "review", dueDate: new Date(Date.now() - 86400000), tags: JSON.stringify(["maintenance"]), userId: "user_1" },
      { id: "task_9", title: "Finalize new employee onboarding docs", description: "Complete all paperwork for the new stylist starting next week", priority: "high", status: "review", dueDate: new Date(Date.now() + 86400000), tags: JSON.stringify(["hr"]), userId: "user_1" },
      { id: "task_10", title: "Order new towel sets", description: "Purchase 50 new premium towel sets for the salon", priority: "medium", status: "done", dueDate: new Date(Date.now() - 4 * 86400000), tags: JSON.stringify(["inventory"]), userId: "user_1" },
      { id: "task_11", title: "Set up online booking system", description: "Configure the new online appointment booking platform", priority: "high", status: "done", dueDate: new Date(Date.now() - 5 * 86400000), tags: JSON.stringify(["tech"]), userId: "user_1" },
      { id: "task_12", title: "Clean and sanitize tools", description: "Monthly deep clean of all salon tools and equipment", priority: "medium", status: "done", dueDate: new Date(Date.now() - 6 * 86400000), tags: JSON.stringify(["maintenance"]), userId: "user_1" },
    ];

    for (const t of tasks) {
      await pool.execute(
        "INSERT IGNORE INTO Task (id, title, description, priority, status, dueDate, tags, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [t.id, t.title, t.description, t.priority, t.status, t.dueDate, t.tags, t.userId]
      );
    }

    // Inventory items
    const inventory = [
      { id: "inv_1", name: "Premium Hair Color Kit", category: "Color", stock: 24, minStock: 10, price: 45.00, supplier: "ColorPro Inc.", lastOrdered: new Date("2026-07-20") },
      { id: "inv_2", name: "Professional Shampoo", category: "Hair Care", stock: 8, minStock: 15, price: 12.50, supplier: "HairCare Supply", lastOrdered: new Date("2026-07-15") },
      { id: "inv_3", name: "Styling Gel", category: "Styling", stock: 42, minStock: 20, price: 8.99, supplier: "StyleMax", lastOrdered: new Date("2026-07-18") },
      { id: "inv_4", name: "Disposable Gloves (Box)", category: "Supplies", stock: 3, minStock: 10, price: 15.00, supplier: "SafeHands Co.", lastOrdered: new Date("2026-07-10") },
      { id: "inv_5", name: "Hair Treatment Mask", category: "Hair Care", stock: 18, minStock: 10, price: 22.00, supplier: "HairCare Supply", lastOrdered: new Date("2026-07-22") },
      { id: "inv_6", name: "Nail Polish Set", category: "Nails", stock: 15, minStock: 8, price: 35.00, supplier: "NailArt Pro", lastOrdered: new Date("2026-07-19") },
      { id: "inv_7", name: "Facial Cleanser", category: "Skin Care", stock: 6, minStock: 12, price: 18.50, supplier: "GlowSkin Inc.", lastOrdered: new Date("2026-07-12") },
      { id: "inv_8", name: "Towels (Pack of 10)", category: "Supplies", stock: 5, minStock: 5, price: 28.00, supplier: "LinenCo", lastOrdered: new Date("2026-07-08") },
      { id: "inv_9", name: "Hair Dryer Nozzle", category: "Equipment", stock: 12, minStock: 4, price: 15.99, supplier: "ProTools Ltd.", lastOrdered: new Date("2026-07-14") },
      { id: "inv_10", name: "Developer Cream 30 Vol", category: "Color", stock: 0, minStock: 8, price: 9.99, supplier: "ColorPro Inc.", lastOrdered: new Date("2026-07-05") },
    ];

    for (const item of inventory) {
      await pool.execute(
        "INSERT IGNORE INTO InventoryItem (id, name, category, stock, minStock, price, supplier, lastOrdered) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [item.id, item.name, item.category, item.stock, item.minStock, item.price, item.supplier, item.lastOrdered]
      );
    }

    console.log("Seed data inserted successfully!");
    console.log("");
    console.log("Demo accounts:");
    console.log("  Admin:   admin@glamour.com / admin123");
    console.log("  Stylist: stylist@glamour.com / stylist123");
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
