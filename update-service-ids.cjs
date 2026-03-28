// ============================================================
// MySocialBoost — Update JAP Service IDs in Firestore
// ============================================================
// Run this AFTER you have filled in japServiceIdNormal and
// japServiceIdPremium in jap-id-assignment.json
//
// Run:
//    node update-service-ids.js
// ============================================================

require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const assignments = require("./jap-id-assignment.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function updateServiceIds() {
  console.log("🚀 Updating JAP Service IDs in Firestore...\n");

  const entries = Object.entries(assignments);
  let success = 0;
  let skipped = 0;
  let failed  = 0;

  for (const [docId, data] of entries) {
    const normalId  = data.japServiceIdNormal;
    const premiumId = data.japServiceIdPremium;

    // Skip if still 0 (not filled in yet)
    if (normalId === 0 && premiumId === 0) {
      console.log(`  ⏭️  Skipped  — ${docId} (IDs not filled in)`);
      skipped++;
      continue;
    }

    try {
      await db.collection("services").doc(docId).update({
        japServiceIdNormal:  normalId,
        japServiceIdPremium: premiumId,
      });
      console.log(`  ✅ Updated  — ${docId} | Normal: ${normalId} | Premium: ${premiumId}`);
      success++;
    } catch (err) {
      console.error(`  ❌ Failed   — ${docId} | ${err.message}`);
      failed++;
    }
  }

  console.log("\n==========================================");
  console.log(`✅ Updated:  ${success}`);
  console.log(`⏭️  Skipped:  ${skipped} (IDs still 0)`);
  console.log(`❌ Failed:   ${failed}`);
  console.log("==========================================");

  if (skipped > 0) {
    console.log(`\n⚠️  You have ${skipped} services still missing IDs.`);
    console.log("   Open jap-id-assignment.json, fill them in, and run this script again.");
  } else {
    console.log("\n🎉 All service IDs updated in Firestore!");
  }

  process.exit(0);
}

updateServiceIds();
