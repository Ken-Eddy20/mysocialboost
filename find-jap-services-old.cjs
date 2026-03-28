// ============================================================
// MySocialBoost — JAP Service ID Finder
// ============================================================
// This script fetches ALL services from JAP and filters them
// by your 8 platforms, then prints them in a clean list so
// you can easily pick your Normal and Premium IDs.
//
// SETUP:
// 1. Place this file in your project folder
// 2. Create a .env file in the same folder with:
//    JAP_API_KEY=your_real_jap_key_here
// 3. Run:
//    npm install node-fetch dotenv
//    node find-jap-services.js
//
// OUTPUT:
// A file called "jap-services-filtered.json" with all
// matching services grouped by platform, plus a
// "services-updated.json" ready to import into Firestore.
// ============================================================

require("dotenv").config();
const https = require("https");
const fs = require("fs");

const JAP_API_KEY = process.env.JAP_API_KEY;

if (!JAP_API_KEY || JAP_API_KEY === "your_real_jap_key_here") {
  console.error("❌ No JAP API key found. Please add it to your .env file.");
  console.error('   JAP_API_KEY=your_real_jap_key_here');
  process.exit(1);
}

// ============================================================
// PLATFORMS & KEYWORDS TO MATCH
// ============================================================
const PLATFORM_KEYWORDS = {
  TikTok:    ["tiktok", "tik tok"],
  Instagram: ["instagram", "ig "],
  Facebook:  ["facebook", "fb "],
  YouTube:   ["youtube", "yt "],
  Twitter:   ["twitter", "tweet", "x followers", "x likes"],
  Snapchat:  ["snapchat", "snap "],
  LinkedIn:  ["linkedin", "linked in"],
  Spotify:   ["spotify"],
};

// ============================================================
// CATEGORY KEYWORDS TO MATCH
// ============================================================
const CATEGORY_KEYWORDS = {
  Followers:   ["followers", "subscribers", "connections"],
  Views:       ["views", "plays", "streams", "listeners", "impressions", "reach", "spotlight"],
  Likes:       ["likes", "hearts", "page likes"],
  Comments:    ["comments"],
  Shares:      ["shares", "retweets", "repost"],
  Saves:       ["saves", "bookmarks"],
  Live:        ["live", "stream viewers", "space listeners"],
  "Watch Time":["watch time", "watchtime"],
};

// ============================================================
// FETCH JAP SERVICES
// ============================================================
function fetchJAPServices() {
  return new Promise((resolve, reject) => {
    const url = `https://justanotherpanel.com/api/v2?key=${JAP_API_KEY}&action=services`;
    console.log("🌐 Fetching all services from JAP...");

    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error("JAP API Error: " + parsed.error));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error("Failed to parse JAP response: " + e.message));
        }
      });
    }).on("error", reject);
  });
}

// ============================================================
// DETECT PLATFORM
// ============================================================
function detectPlatform(serviceName) {
  const lower = serviceName.toLowerCase();
  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return platform;
    }
  }
  return null;
}

// ============================================================
// DETECT CATEGORY
// ============================================================
function detectCategory(serviceName) {
  const lower = serviceName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "Other";
}

// ============================================================
// GUESS TIER (Normal vs Premium)
// ============================================================
function guessTier(serviceName) {
  const lower = serviceName.toLowerCase();
  const premiumKeywords = ["hq", "high quality", "premium", "real", "guaranteed", "refill", "stable", "retention", "organic", "targeted", "slow"];
  const normalKeywords  = ["cheap", "fast", "instant", "bot", "no refill", "bulk", "non drop"];

  if (premiumKeywords.some((kw) => lower.includes(kw))) return "Premium (suggested)";
  if (normalKeywords.some((kw) => lower.includes(kw)))  return "Normal (suggested)";
  return "Undecided — review manually";
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("🚀 MySocialBoost — JAP Service ID Finder");
  console.log("==========================================\n");

  let allServices;
  try {
    allServices = await fetchJAPServices();
  } catch (err) {
    console.error("❌ Failed to fetch services:", err.message);
    process.exit(1);
  }

  console.log(`✅ Fetched ${allServices.length} total services from JAP\n`);

  // Group by platform
  const grouped = {};
  for (const platform of Object.keys(PLATFORM_KEYWORDS)) {
    grouped[platform] = [];
  }

  for (const service of allServices) {
    const platform = detectPlatform(service.name);
    if (!platform) continue;

    // JAP API returns ID as 'service' field not 'id'
    const serviceId = service.service || service.id || service.service_id || "unknown";

    grouped[platform].push({
      id:          serviceId,
      name:        service.name,
      category:    detectCategory(service.name),
      tier:        guessTier(service.name),
      rate:        `$${service.rate} per 1000`,
      min:         service.min,
      max:         service.max,
      refill:      service.refill ? "Yes" : "No",
      cancel:      service.cancel ? "Yes" : "No",
    });
  }

  // ============================================================
  // PRINT TO TERMINAL — clean table per platform
  // ============================================================
  for (const [platform, services] of Object.entries(grouped)) {
    if (services.length === 0) continue;

    console.log("=".repeat(80));
    console.log(`📱 ${platform.toUpperCase()} — ${services.length} services found`);
    console.log("=".repeat(80));

    // Group by category
    const byCategory = {};
    for (const svc of services) {
      if (!byCategory[svc.category]) byCategory[svc.category] = [];
      byCategory[svc.category].push(svc);
    }

    for (const [category, svcs] of Object.entries(byCategory)) {
      console.log(`\n  📂 ${category}`);
      console.log("  " + "-".repeat(76));
      for (const svc of svcs) {
        console.log(`  ID: ${String(svc.id).padEnd(8)} | ${svc.rate.padEnd(18)} | Min: ${String(svc.min).padEnd(8)} | Max: ${String(svc.max).padEnd(10)} | Refill: ${svc.refill.padEnd(4)} | ${svc.tier}`);
        console.log(`             Name: ${svc.name}`);
        console.log("");
      }
    }
  }

  // ============================================================
  // SAVE FILTERED LIST TO FILE
  // ============================================================
  fs.writeFileSync(
    "jap-services-filtered.json",
    JSON.stringify(grouped, null, 2)
  );
  console.log("\n✅ Full filtered list saved to: jap-services-filtered.json");

  // ============================================================
  // GENERATE ASSIGNMENT TEMPLATE
  // ============================================================
  const template = generateAssignmentTemplate(grouped);
  fs.writeFileSync(
    "jap-id-assignment.json",
    JSON.stringify(template, null, 2)
  );
  console.log("✅ Assignment template saved to:  jap-id-assignment.json");

  console.log("\n==========================================");
  console.log("📝 NEXT STEPS:");
  console.log("==========================================");
  console.log("1. Open jap-services-filtered.json");
  console.log("   → Look through each platform");
  console.log("   → Pick one service ID for Normal (cheap/fast)");
  console.log("   → Pick one service ID for Premium (HQ/refill)");
  console.log("");
  console.log("2. Open jap-id-assignment.json");
  console.log("   → Fill in japServiceIdNormal and japServiceIdPremium");
  console.log("   → for each of your 46 services");
  console.log("");
  console.log("3. Run the update script:");
  console.log("   node update-service-ids.js");
  console.log("   → This will update your Firestore services collection");
  console.log("==========================================\n");
}

// ============================================================
// GENERATE ASSIGNMENT TEMPLATE
// ============================================================
function generateAssignmentTemplate(grouped) {
  const serviceKeys = {
    TikTok:    ["tiktok_followers","tiktok_views","tiktok_likes","tiktok_comments","tiktok_live_views","tiktok_shares","tiktok_saves"],
    Instagram: ["instagram_followers","instagram_likes","instagram_reel_views","instagram_story_views","instagram_comments","instagram_saves","instagram_impressions","instagram_igtv_views"],
    Facebook:  ["facebook_followers","facebook_page_likes","facebook_post_likes","facebook_video_views","facebook_shares","facebook_live_views"],
    YouTube:   ["youtube_subscribers","youtube_views","youtube_likes","youtube_comments","youtube_watch_time","youtube_shorts_views","youtube_live_views"],
    Twitter:   ["twitter_followers","twitter_likes","twitter_retweets","twitter_impressions","twitter_space_listeners"],
    Snapchat:  ["snapchat_followers","snapchat_story_views","snapchat_spotlight_views"],
    LinkedIn:  ["linkedin_followers","linkedin_post_likes","linkedin_connections","linkedin_profile_views","linkedin_impressions","linkedin_comments"],
    Spotify:   ["spotify_followers","spotify_plays","spotify_monthly_listeners","spotify_saves","spotify_playlist_followers","spotify_podcast_plays"],
  };

  const template = {};
  for (const [platform, keys] of Object.entries(serviceKeys)) {
    const available = grouped[platform] || [];
    for (const key of keys) {
      template[key] = {
        _instruction: `Pick IDs from ${platform} services above`,
        _availableIds: available.slice(0, 5).map(s => ({ id: s.id, name: s.name, rate: s.rate })),
        japServiceIdNormal:  0,
        japServiceIdPremium: 0,
      };
    }
  }
  return template;
}

main();
