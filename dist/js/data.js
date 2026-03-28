/* ======================== CONFIG VARIABLES ======================== */
const PAYSTACK_PUBLIC_KEY = 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE';
let GHS_TO_USD = 0.092; // Fallback rate (approx 1 USD = 10.8 GHS)

// Dynamically fetch the absolute latest live market rate asynchronously
fetch('https://open.er-api.com/v6/latest/GHS')
    .then(res => res.json())
    .then(data => {
        if (data && data.rates && data.rates.USD) {
            GHS_TO_USD = data.rates.USD;
        }
    }).catch(e => console.warn('Could not fetch live GHS rate, using static fallback.'));

const SERVICE_IDS = {};
/* ================================================================== */

const services = {
    'TikTok': {
        'Followers': [
            { id: 'TT-FOL-N', name: 'Followers [Normal]', start: '0-1 Hr', speed: '5K/Day', max: '100K', price: 2.9 },
            { id: 'TT-FOL-P', name: 'Followers [Premium]', start: 'Instant', speed: '10K/Day', max: '500K', price: 6.78 }
        ],
        'Video Views': [
            { id: 'TT-VW-N', name: 'Video Views [Normal]', start: '0-1 Hr', speed: '50K/Day', max: '1M', price: 0.01 },
            { id: 'TT-VW-P', name: 'Video Views [Premium]', start: 'Instant', speed: '100K/Day', max: '10M', price: 0.32 }
        ],
        'Likes': [
            { id: 'TT-LK-N', name: 'Likes [Normal]', start: '0-1 Hr', speed: '10K/Day', max: '100K', price: 0.14 },
            { id: 'TT-LK-P', name: 'Likes [Premium]', start: 'Instant', speed: '20K/Day', max: '500K', price: 0.96 }
        ],
        'Comments': [
            { id: 'TT-CM-N', name: 'Comments [Normal]', start: '0-2 Hrs', speed: '500/Day', max: '5K', price: 0.49 },
            { id: 'TT-CM-P', name: 'Comments [Premium]', start: '0-1 Hr', speed: '1K/Day', max: '10K', price: 0.75 }
        ],
        'Live Stream Views': [
            { id: 'TT-LS-N', name: 'Live Stream Views [Normal]', start: 'Instant', speed: 'N/A', max: '10K', price: 12.00 },
            { id: 'TT-LS-P', name: 'Live Stream Views [Premium]', start: 'Instant', speed: 'N/A', max: '50K', price: 80.00 }
        ],
        'Shares': [
            { id: 'TT-SH-N', name: 'Shares [Normal]', start: '0-1 Hr', speed: '5K/Day', max: '100K', price: 0.20 },
            { id: 'TT-SH-P', name: 'Shares [Premium]', start: 'Instant', speed: '10K/Day', max: '500K', price: 0.80 }
        ],
        'Saves': [
            { id: 'TT-SV-N', name: 'Saves [Normal]', start: '0-1 Hr', speed: '2K/Day', max: '50k', price: 0.20 },
            { id: 'TT-SV-P', name: 'Saves [Premium]', start: 'Instant', speed: '5K/Day', max: '100K', price: 0.64 }
        ]
    },
    'Instagram': {
        'Followers': [
            { id: 'IG-FOL-N', name: 'Followers [Normal]', start: '0-1 Hr', speed: '5K/Day', max: '100K', price: 1.05 },
            { id: 'IG-FOL-P', name: 'Followers [Premium]', start: 'Instant', speed: '10K/Day', max: '500K', price: 6.00 }
        ],
        'Post Likes': [
            { id: 'IG-PL-N', name: 'Post Likes [Normal]', start: '0-1 Hr', speed: '10K/Day', max: '100K', price: 0.16 },
            { id: 'IG-PL-P', name: 'Post Likes [Premium]', start: 'Instant', speed: '20K/Day', max: '500K', price: 0.88 }
        ],
        'Reel Views': [
            { id: 'IG-RV-N', name: 'Reel Views [Normal]', start: '0-1 Hr', speed: '50K/Day', max: '1M', price: 0.02 },
            { id: 'IG-RV-P', name: 'Reel Views [Premium]', start: 'Instant', speed: '100K/Day', max: '10M', price: 0.48 }
        ],
        'Story Views': [
            { id: 'IG-SV-N', name: 'Story Views [Normal]', start: '0-1 Hr', speed: '20K/Day', max: '500K', price: 0.02 },
            { id: 'IG-SV-P', name: 'Story Views [Premium]', start: 'Instant', speed: '50K/Day', max: '1M', price: 0.32 }
        ],
        'Comments': [
            { id: 'IG-CM-N', name: 'Comments [Normal]', start: '0-2 Hrs', speed: '500/Day', max: '5K', price: 2.00 },
            { id: 'IG-CM-P', name: 'Comments [Premium]', start: '0-1 Hr', speed: '1K/Day', max: '10K', price: 8.00 }
        ],
        'Saves': [
            { id: 'IG-SA-N', name: 'Saves [Normal]', start: '0-1 Hr', speed: '2K/Day', max: '50K', price: 0.40 },
            { id: 'IG-SA-P', name: 'Saves [Premium]', start: 'Instant', speed: '5K/Day', max: '100K', price: 1.60 }
        ],
        'Impressions/Reach': [
            { id: 'IG-IR-N', name: 'Impressions/Reach [Normal]', start: '0-1 Hr', speed: '10K/Day', max: '500K', price: 0.20 },
            { id: 'IG-IR-P', name: 'Impressions/Reach [Premium]', start: 'Instant', speed: '20K/Day', max: '1M', price: 0.80 }
        ],
        'IGTV Views': [
            { id: 'IG-IGTV-N', name: 'IGTV Views [Normal]', start: '0-1 Hr', speed: '10K/Day', max: '500K', price: 0.10 },
            { id: 'IG-IGTV-P', name: 'IGTV Views [Premium]', start: 'Instant', speed: '20K/Day', max: '1M', price: 0.48 }
        ]
    },
    'Facebook': {
        'Followers': [
            { id: 'FB-FOL-N', name: 'Followers [Normal]', start: '1-3 Hrs', speed: '2K/Day', max: '50K', price: 0.39 },
            { id: 'FB-FOL-P', name: 'Followers [Premium]', start: '0-1 Hr', speed: '5K/Day', max: '100K', price: 2.40 }
        ],
        'Page Likes': [
            { id: 'FB-PG-N', name: 'Page Likes [Normal]', start: '1-3 Hrs', speed: '2K/Day', max: '50K', price: 0.26 },
            { id: 'FB-PG-P', name: 'Page Likes [Premium]', start: '0-1 Hr', speed: '5K/Day', max: '100K', price: 1.92 }
        ],
        'Post Likes': [
            { id: 'FB-PL-N', name: 'Post Likes [Normal]', start: '1-3 Hrs', speed: '5K/Day', max: '100K', price: 0.26 },
            { id: 'FB-PL-P', name: 'Post Likes [Premium]', start: '0-1 Hr', speed: '10K/Day', max: '200K', price: 0.80 }
        ],
        'Video Views': [
            { id: 'FB-VV-N', name: 'Video Views [Normal]', start: '1-3 Hrs', speed: '20K/Day', max: '500K', price: 0.10 },
            { id: 'FB-VV-P', name: 'Video Views [Premium]', start: '0-1 Hr', speed: '50K/Day', max: '1M', price: 0.48 }
        ],
        'Shares': [
            { id: 'FB-SH-N', name: 'Shares [Normal]', start: '1-3 Hrs', speed: '1K/Day', max: '20K', price: 0.40 },
            { id: 'FB-SH-P', name: 'Shares [Premium]', start: '0-1 Hr', speed: '2K/Day', max: '50K', price: 1.60 }
        ],
        'Live Stream Views': [
            { id: 'FB-LS-N', name: 'Live Stream Views [Normal]', start: 'Instant', speed: 'N/A', max: '5K', price: 10.00 },
            { id: 'FB-LS-P', name: 'Live Stream Views [Premium]', start: 'Instant', speed: 'N/A', max: '20K', price: 8.00 }
        ]
    },
    'YouTube': {
        'Subscribers': [
            { id: 'YT-SUB-N', name: 'Subscribers [Normal]', start: '12-24 Hrs', speed: '500/Day', max: '10K', price: 4.50 },
            { id: 'YT-SUB-P', name: 'Subscribers [Premium]', start: '1-12 Hrs', speed: '1K/Day', max: '50K', price: 15.00 }
        ],
        'Video Views': [
            { id: 'YT-VV-N', name: 'Video Views [Normal]', start: '1-12 Hrs', speed: '10K/Day', max: '100K', price: 0.10 },
            { id: 'YT-VV-P', name: 'Video Views [Premium]', start: '0-2 Hrs', speed: '50K/Day', max: '1M', price: 1.60 }
        ],
        'Likes': [
            { id: 'YT-LK-N', name: 'Likes [Normal]', start: '1-12 Hrs', speed: '1K/Day', max: '20K', price: 0.20 },
            { id: 'YT-LK-P', name: 'Likes [Premium]', start: '0-2 Hrs', speed: '5K/Day', max: '100K', price: 1.28 }
        ],
        'Comments': [
            { id: 'YT-CM-N', name: 'Comments [Normal]', start: '12-24 Hrs', speed: '100/Day', max: '1K', price: 3.00 },
            { id: 'YT-CM-P', name: 'Comments [Premium]', start: '1-12 Hrs', speed: '200/Day', max: '5K', price: 12.80 }
        ],
        'Watch Time (hrs)': [
            { id: 'YT-WT-N', name: 'Watch Time (hrs) [Normal]', start: '24-48 Hrs', speed: '500 Hrs/Day', max: '4000', price: 4.00 },
            { id: 'YT-WT-P', name: 'Watch Time (hrs) [Premium]', start: '12-24 Hrs', speed: '1K Hrs/Day', max: '8000', price: 16.00 }
        ],
        'Shorts Views': [
            { id: 'YT-SV-N', name: 'Shorts Views [Normal]', start: '1-12 Hrs', speed: '10K/Day', max: '100K', price: 0.02 },
            { id: 'YT-SV-P', name: 'Shorts Views [Premium]', start: '0-2 Hrs', speed: '50K/Day', max: '1M', price: 0.32 }
        ],
        'Live Stream Views': [
            { id: 'YT-LS-N', name: 'Live Stream Views [Normal]', start: 'Instant', speed: 'N/A', max: '5K', price: 10.00 },
            { id: 'YT-LS-P', name: 'Live Stream Views [Premium]', start: 'Instant', speed: 'N/A', max: '20K', price: 8.00 }
        ]
    },
    'Twitter/X': {
        'Followers': [
            { id: 'TW-FOL-N', name: 'Followers [Normal]', start: '1-3 Hrs', speed: '1K/Day', max: '50K', price: 1.50 },
            { id: 'TW-FOL-P', name: 'Followers [Premium]', start: '0-1 Hr', speed: '5K/Day', max: '100K', price: 6.00 }
        ],
        'Likes': [
            { id: 'TW-LK-N', name: 'Likes [Normal]', start: '1-3 Hrs', speed: '2K/Day', max: '50K', price: 0.20 },
            { id: 'TW-LK-P', name: 'Likes [Premium]', start: '0-1 Hr', speed: '10K/Day', max: '100K', price: 0.80 }
        ],
        'Retweets': [
            { id: 'TW-RT-N', name: 'Retweets [Normal]', start: '1-3 Hrs', speed: '1K/Day', max: '50K', price: 0.40 },
            { id: 'TW-RT-P', name: 'Retweets [Premium]', start: '0-1 Hr', speed: '5K/Day', max: '100K', price: 1.60 }
        ],
        'Impressions/Views': [
            { id: 'TW-IV-N', name: 'Impressions/Views [Normal]', start: '1-3 Hrs', speed: '10K/Day', max: '500K', price: 0.10 },
            { id: 'TW-IV-P', name: 'Impressions/Views [Premium]', start: '0-1 Hr', speed: '50K/Day', max: '1M', price: 0.48 }
        ],
        'Space Listeners': [
            { id: 'TW-SL-N', name: 'Space Listeners [Normal]', start: 'Instant', speed: 'N/A', max: '5K', price: 2.00 },
            { id: 'TW-SL-P', name: 'Space Listeners [Premium]', start: 'Instant', speed: 'N/A', max: '20K', price: 1.60 }
        ]
    },
    'Snapchat': {
        'Followers': [
            { id: 'SC-FOL-N', name: 'Followers [Normal]', start: '1-8 Hrs', speed: '500/Day', max: '10K', price: 3.00 },
            { id: 'SC-FOL-P', name: 'Followers [Premium]', start: '0-2 Hrs', speed: '2K/Day', max: '50K', price: 9.00 }
        ],
        'Story Views': [
            { id: 'SC-SV-N', name: 'Story Views [Normal]', start: '1-8 Hrs', speed: '1K/Day', max: '20K', price: 0.10 },
            { id: 'SC-SV-P', name: 'Story Views [Premium]', start: '0-2 Hrs', speed: '5K/Day', max: '100K', price: 0.80 }
        ],
        'Spotlight Views': [
            { id: 'SC-SPV-N', name: 'Spotlight Views [Normal]', start: '1-8 Hrs', speed: '2K/Day', max: '50K', price: 0.20 },
            { id: 'SC-SPV-P', name: 'Spotlight Views [Premium]', start: '0-2 Hrs', speed: '10K/Day', max: '200K', price: 1.28 }
        ]
    },
    'LinkedIn': {
        'Followers': [
            { id: 'LI-FOL-N', name: 'Followers [Basic]', start: '1-12 Hrs', speed: '500/Day', max: '10K', price: 35.00 },
            { id: 'LI-FOL-P', name: 'Followers [Premium]', start: '0-6 Hrs', speed: '2K/Day', max: '50K', price: 100.00 }
        ],
        'Connections': [
            { id: 'LI-CN-N', name: 'Connections [Basic]', start: '24 Hrs', speed: '100/Day', max: '5K', price: 100.00 },
            { id: 'LI-CN-P', name: 'Connections [Premium]', start: '12 Hrs', speed: '500/Day', max: '20K', price: 150.00 }
        ],
        'Likes': [
            { id: 'LI-PL-N', name: 'Likes [Basic]', start: '1-12 Hrs', speed: '200/Day', max: '5K', price: 15.00 },
            { id: 'LI-PL-P', name: 'Likes [Premium]', start: '0-6 Hrs', speed: '1K/Day', max: '20K', price: 50.00 }
        ],
        'Comments': [
            { id: 'LI-CM-N', name: 'Comments [Basic]', start: '24 Hrs', speed: '50/Day', max: '1K', price: 300.00 },
            { id: 'LI-CM-P', name: 'Comments [Premium]', start: '12 Hrs', speed: '200/Day', max: '5K', price: 400.00 }
        ],
        'Endorsements': [
            { id: 'LI-EN-N', name: 'Endorsements [Basic]', start: '1-12 Hrs', speed: '100/Day', max: '5K', price: 30.00 },
            { id: 'LI-EN-P', name: 'Endorsements [Premium]', start: '0-6 Hrs', speed: '500/Day', max: '20K', price: 200.00 }
        ],
        'Reshares': [
            { id: 'LI-RS-N', name: 'Reshares [Basic]', start: '1-12 Hrs', speed: '100/Day', max: '5K', price: 40.00 },
            { id: 'LI-RS-P', name: 'Reshares [Premium]', start: '0-6 Hrs', speed: '500/Day', max: '20K', price: 100.00 }
        ]
    },
    'Spotify': {
        'Followers': [
            { id: 'SP-FOL-N', name: 'Followers [Normal]', start: '1-12 Hrs', speed: '1K/Day', max: '20K', price: 3.00 },
            { id: 'SP-FOL-P', name: 'Followers [Premium]', start: '0-6 Hrs', speed: '5K/Day', max: '100K', price: 9.00 }
        ],
        'Plays / Streams': [
            { id: 'SP-PL-N', name: 'Plays / Streams [Normal]', start: '0-2 Hrs', speed: '5K/Day', max: '100K', price: 0.20 },
            { id: 'SP-PL-P', name: 'Plays / Streams [Premium]', start: 'Instant', speed: '20K/Day', max: '1M', price: 2.40 }
        ],
        'Monthly Listeners': [
            { id: 'SP-ML-N', name: 'Monthly Listeners [Normal]', start: '12-24 Hrs', speed: '2K/Day', max: '50K', price: 1.00 },
            { id: 'SP-ML-P', name: 'Monthly Listeners [Premium]', start: '0-12 Hrs', speed: '10K/Day', max: '200K', price: 3.20 }
        ],
        'Saves': [
            { id: 'SP-SV-N', name: 'Saves [Normal]', start: '1-12 Hrs', speed: '1K/Day', max: '20K', price: 1.00 },
            { id: 'SP-SV-P', name: 'Saves [Premium]', start: '0-6 Hrs', speed: '5K/Day', max: '100K', price: 2.40 }
        ],
        'Playlist Followers': [
            { id: 'SP-PF-N', name: 'Playlist Followers [Normal]', start: '1-12 Hrs', speed: '500/Day', max: '10K', price: 2.00 },
            { id: 'SP-PF-P', name: 'Playlist Followers [Premium]', start: '0-6 Hrs', speed: '2K/Day', max: '50K', price: 4.00 }
        ],
        'Podcast Plays': [
            { id: 'SP-PP-N', name: 'Podcast Plays [Normal]', start: '1-12 Hrs', speed: '1K/Day', max: '50K', price: 0.30 },
            { id: 'SP-PP-P', name: 'Podcast Plays [Premium]', start: '0-6 Hrs', speed: '5K/Day', max: '200K', price: 1.60 }
        ],
        'Artist Followers': [
            { id: 'SP-AF-N', name: 'Artist Followers [Normal]', start: '1-12 Hrs', speed: '1K/Day', max: '20K', price: 3.00 },
            { id: 'SP-AF-P', name: 'Artist Followers [Premium]', start: '0-6 Hrs', speed: '5K/Day', max: '100K', price: 9.00 }
        ]
    },
    'WhatsApp': {
        'Channels': [
            { id: 'WA-CB-N', name: 'Channel Followers (Boost)', start: '1-3 Hours', speed: '500/Day', max: '10K', price: 5.00 },
            { id: 'WA-CR-N', name: 'Channel Reactions', start: '0-1 Hour', speed: '5K/Day', max: '20K', price: 2.50 }
        ]
    }
};
