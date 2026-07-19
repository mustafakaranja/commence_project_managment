const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");

  const col = mongoose.connection.collection("members");

  // Remove existing admin to start fresh
  await col.deleteOne({ username: "admin" });
  console.log("Cleared old admin (if any).");

  const passwordHash = await bcrypt.hash("admin@123", 12);

  await col.insertOne({
    fullName: "Mustafa Karanjawala",
    designation: "Director",
    username: "admin",
    email: "admin@commence.com",
    passwordHash,
    role: "admin",
    portalAccess: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ Admin user created:");
  console.log("   Email:    admin@commence.com");
  console.log("   Username: admin");
  console.log("   Password: admin@123");
  console.log("   Role:     admin");

  // Verify
  const saved = await col.findOne({ username: "admin" });
  const valid = await bcrypt.compare("admin@123", saved.passwordHash);
  console.log("✅ Password verification:", valid ? "PASSED" : "FAILED");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
});
