/* ======================== CONFIG VARIABLES ======================== */
/* Top-ups: full-page Paystack via POST /api/paystack/initialize (secret stays on server). */
let GHS_TO_USD = 0.067;

function refreshGhsUsdRate() {
    fetch('/api/fx/ghs-usd')
        .then(r => r.json())
        .then(d => {
            if (d && typeof d.ghsToUsd === 'number' && d.ghsToUsd > 0) {
                GHS_TO_USD = d.ghsToUsd;
            }
        })
        .catch(() => {});
}
refreshGhsUsdRate();
setInterval(refreshGhsUsdRate, 10 * 60 * 1000);

const services = {
    'TikTok': {
        'Followers': [
            { id: '10136', name: 'Followers [Normal] [No Refill]', start: '0-1 Hr', speed: '3K/Day', max: '1M', price: 2.9 },
            { id: '10093', name: 'Followers [Premium] [Refill]', start: 'Instant', speed: '20K/Day', max: '10M', price: 6.78 }
        ],
        'Video Views': [
            { id: '10019', name: 'Video Views [Normal] [No Refill]', start: '0-2 Hr', speed: '5M/Day', max: '30M', price: 0.01 },
            { id: '3365', name: 'Video Views [Premium] [Refill]', start: 'Instant', speed: '1M/Day', max: '1M', price: 0.32 }
        ],
        'Likes': [
            { id: '10023', name: 'Likes [Normal] [No Refill]', start: '0-1 Hr', speed: '50K/Day', max: '1M', price: 0.14 },
            { id: '2912', name: 'Likes [Premium] [Refill]', start: 'Instant', speed: '500K/Day', max: '1M', price: 0.96 }
        ],
        'Comments': [
            { id: '9999', name: 'Comments [Normal] [No Refill]', start: '0-2 Hrs', speed: '10K/Day', max: '100K', price: 3.49 },
            { id: '7054', name: 'Comments [Premium] [Refill]', start: '0-1 Hr', speed: '1K/Hour', max: '10K', price: 8.31 }
        ],
        'Live Stream Views': [
            { id: '8653', name: 'Live Stream Views [Normal] [No Refill]', start: 'Instant', stay: '60 Minutes', max: '50K', price: 12.00 },
            { id: '8715', name: 'Live Stream Views [Premium] [Refill]', start: 'Instant', stay: '300 Minutes', max: '50K', price: 50.00 }
        ],
        'Shares': [
            { id: '8066', name: 'Shares [Normal] [No Refill]', start: '0-1 Hr', speed: '100K/Day', max: '100K', price: 0.20 },
            { id: '1396', name: 'Shares [Premium] [Refill]', start: 'Instant', speed: '100K/Day', max: '100K', price: 4.80 }
        ],
        'Saves': [
            { id: '54', name: 'Saves [Normal] [No Refill]', start: '0-1 Hr', speed: '50K/Day', max: '100k', price: 0.20 },
            { id: '10002', name: 'Saves [Premium] [Refill]', start: 'Instant', speed: '10K/Day', max: '10K', price: 0.64 }
        ]
    },
    'Instagram': {
        'Followers': [
            { id: '8504', name: 'Followers [Normal] [No Refill]', start: '0-1 Hr', speed: '100K/Day', max: '1M', price: 3.5 },
            { id: '1582', name: 'Followers [Premium] [Refill]', start: 'Instant', speed: '100K/Day', max: '10M', price: 8.00 }
        ],
        'Post Likes': [
            { id: '10126', name: 'Post Likes [Normal] [No Refill]', start: '0-1 Hr', speed: '100K/Day', max: '1.5M', price: 1.16 },
            { id: '1761', name: 'Post Likes [Premium] [Refill]', start: 'Instant', speed: '60K/Day', max: '500K', price: 4.88 }
        ],
        'Reel Views': [
            { id: '3528', name: 'Reel Views [Normal] [No Refill]', start: '0-1 Hr', speed: '1M/Day', max: '10M', price: 0.02 },
            { id: '6691', name: 'Reel Views [Premium] [Refill]', start: 'Instant', speed: '100M/Day', max: '100M', price: 0.48 }
        ],
        'Story Views': [
            { id: '312', name: 'Story Views [Normal] [No Refill]', start: '0-1 Hr', speed: '100K/Day', max: '100K', price: 0.02 },
            { id: '3428', name: 'Story Views [Premium] [Refill]', start: '0-1 Hr', speed: 'Instant', max: '10K', price: 1.32 }
        ],
        'Comments': [
            { id: '894', name: 'Comments [Normal] [No Refill]', start: '0-2 Hrs', speed: '2K/Day', max: '2K', price: 3.00 },
            { id: '8563', name: 'Comments [Premium] [Refill]', start: '0-3 Hr', speed: '60K/Day', max: '300K', price: 8.00 }
        ],
        'Saves': [
            { id: '7672', name: 'Saves [Normal] [No Refill]', start: '0-1 Hr', speed: '100K/Day', max: '100K', price: 0.40 },
            { id: '448', name: 'Saves [Premium] [Refill]', start: 'Instant', speed: '15K/Day', max: '400K', price: 1.60 }
        ],
        'Impressions/Reach': [
            { id: '7590', name: 'Impressions/Reach [Normal] [No Refill]', start: '0-1 Hr', speed: '50K/Day', max: '500K', price: 0.20 },
            { id: '7038', name: 'Impressions/Reach [Premium] [Refill]', start: '0-1 Hr', speed: 'Instant', max: '1M', price: 0.80 }
        ],
        'IGTV Views': [
            { id: '4239', name: 'IGTV Views [Normal] [No Refill]', start: '0-1 Hr', speed: 'Instant', max: '10M', price: 0.10 },
            { id: '5991', name: 'IGTV Views [Premium] [Refill]', start: 'Instant', speed: '1M/Day', max: '10M', price: 0.88 }
        ]
    },
    'Facebook': {
        'Followers': [
            { id: '9231', name: 'Followers [Normal] [No Refill]', start: '1-3 Hrs', speed: '10K/Day', max: '1M', price: 1.89 },
            { id: '9314', name: 'Followers [Premium] [Refill]', start: '0-1 Hr', speed: '40K/Day', max: '2M', price: 4.40 }
        ],
        'Page Likes': [
            { id: '8999', name: 'Page Likes [Normal] [No Refill]', start: '1-6 Hrs', speed: '10K/Day', max: '2M', price: 1.26 },
            { id: '1722', name: 'Page Likes [Premium] [Refill]', start: '0-6 Hr', speed: '40K/Day', max: '1M', price: 1.92 }
        ],
        'Post Likes': [
            { id: '10098', name: 'Post Likes [Normal] [No Refill]', start: '1-3 Hrs', speed: '10K/Day', max: '100K', price: 0.76 },
            { id: '7963', name: 'Post Likes [Premium] [Refill]', start: '0-1 Hr', speed: '10K/Day', max: '50K', price: 2.80 }
        ],
        'Video Views': [
            { id: '6711', name: 'Video Views [Normal] [No Refill]', start: '1-3 Hrs', speed: '1M/Day', max: '1M', price: 1.10 },
            { id: '7825', name: 'Video Views [Premium] [Refill]', start: '0-1 Hr', speed: '1M/Day', max: '1M', price: 3.48 }
        ],
        'Shares': [
            { id: '9977', name: 'Shares [Normal] [No Refill]', start: '1-3 Hrs', speed: '500K/Day', max: '1M', price: 2.40 },
            { id: '553', name: 'Shares [Premium] [Refill]', start: '0-1 Hr', speed: '25K/Day', max: '200K', price: 1.60 }
        ],
        'Live Stream Views': [
            { id: '5794', name: 'Live Stream Views [Normal] [No Refill]', start: 'Instant', stay: '30 Minutes', max: '5K', price: 10.00 },
            { id: '3261', name: 'Live Stream Views [Premium] [Refill]', start: 'Instant', stay: '150 Minutes', max: '2K', price: 20.00 }
        ]
    },
    'YouTube': {
        'Subscribers': [
            { id: '4395', name: 'Subscribers [Normal] [No Refill]', start: '1 Hour', speed: '20K/Day', max: '50K', price: 6.50 },
            { id: '2976', name: 'Subscribers [Premium] [Refill]', start: '0-6 Hrs', speed: '1K/Day', max: '100K', price: 50.00 }
        ],
        'Video Views': [
            { id: '9252', name: 'Video Views [Normal] [No Refill]', start: '0-2 Hrs', speed: 'Up to 500/Day', max: '1M', price: 2.10 },
            { id: '9259', name: 'Video Views [Premium] [Refill]', start: '0-2 Hrs', speed: 'Up to 3K/Day', max: '10M', price: 1.60 }
        ],
        'Likes': [
            { id: '9535', name: 'Likes [Normal] [No Refill]', start: 'Instant', speed: '100K/Day', max: '100K', price: 1.20 },
            { id: '1912', name: 'Likes [Premium] [Refill]', start: '0-2 Hrs', speed: '5K/Day', max: '100K', price: 3.28 }
        ],
        'Comments': [
            { id: '371', name: 'Comments [Normal] [No Refill]', start: '0-2 Hrs', speed: '10K/Day', max: '10K', price: 6.00 },
            { id: '8737', name: 'Comments [Premium] [Refill]', start: '0-3 Hrs', speed: '20K/Day', max: '200K', price: 12.80 }
        ],
        'Watch Time (hrs)': [
            { id: '3389', name: 'Watch Time (hrs) [Normal] [No Refill]', start: '12-14 Hrs', speed: '20K/Day', time: '60+ Minutes', price: 25.00 },
            { id: '5782', name: 'Watch Time (hrs) [Premium] [Refill]', start: '0-2 Hrs', time: '60+ Minutes', max: '2K', price: 37.00 }
        ],
        'Shorts Views': [
            { id: '7417', name: 'Shorts Views [Normal] [No Refill]', start: '1 Hr', speed: '20K/Day', max: '2M', price: 1.82 },
            { id: '7979', name: 'Shorts Views [Premium] [Refill]', start: '0-1 Hrs', speed: '60K/Day', max: '5M', price: 0.32 }
        ],
        'Live Stream Views': [
            { id: '6565', name: 'Live Stream Views [Normal] [No Refill]', start: 'Instant', stay: '30 Minutes', max: '50K', price: 6.00 },
            { id: '6567', name: 'Live Stream Views [Premium] [Refill]', start: 'Instant', stay: '3 Hours', max: '50K', price: 20.00 }
        ]
    },
    'Twitter/X': {
        'Followers': [
            { id: '9276', name: 'Followers [Normal] [No Refill]', start: '0-2 Hrs', speed: '100K/Day', max: '200K', price: 2.50 },
            { id: '9158', name: 'Followers [Premium] [Refill]', start: '0-3 Hr', speed: '1M/Day', max: '5M', price: 12.00 }
        ],
        'Likes': [
            { id: '8858', name: 'Likes [Normal] [No Refill]', start: '0-1 Hrs', speed: '15K/Day', max: '50K', price: 4.20 },
            { id: '9327', name: 'Likes [Premium] [Refill]', start: '0-1 Hr', speed: '100K/Day', max: '1M', price: 6.80 }
        ],
        'Retweets': [
            { id: '8251', name: 'Retweets [Normal] [No Refill]', start: '0-2 Hrs', speed: '10K/Day', max: '50K', price: 2.80 },
            { id: '615', name: 'Retweets [Premium] [Refill]', start: '0-1 Hr', speed: '10/Day', max: '6M', price: 12.60 }
        ],
        'Impressions/Views': [
            { id: '7725', name: 'Impressions/Views [Normal] [No Refill]', start: '0-1 Hrs', speed: '10M/Day', max: '100M', price: 0.70 },
            { id: '1375', name: 'Impressions/Views [Premium] [Refill]', start: '0-1 Hr', speed: '1M/Day', max: '10M', price: 2.48 }
        ],
        'Space Listeners': [
            { id: '2253', name: 'Space Listeners [Normal] [No Refill]', start: 'Instant', stay: '60 Minutes', max: '20K', price: 2.00 },
            { id: '2009', name: 'Space Listeners [Premium] [Refill]', start: 'Instant', stay: '120 Minutes', max: '2.5K', price: 21.60 }
        ]
    },
    'Snapchat': {
        'Followers': [
            { id: '7079', name: 'Followers [Normal] [No Refill]', start: '0-12 Hrs', speed: '1K/Day', max: '100K', price: 31.00 },
            { id: '7087', name: 'Followers [Premium] [Refill]', start: '0-6 Hrs', speed: '1K/Day', max: '100K', price: 52.50 }
        ],
        'Story Views': [
            { id: '7094', name: 'Story Views [Normal] [No Refill]', start: '0-6 Hrs', speed: 'Done in 24 hours', number: '100 views on all stories', price: 6.10 },
            { id: '7080', name: 'Story Views [Premium] [Refill]', start: '0-1 Hrs', speed: '1K/Day', max: '10K', price: 35.80 }
        ],
        'Spotlight Views': [
            { id: '2065', name: 'Spotlight Views [Normal] [No Refill]', start: '0-6 Hrs', speed: '100K/Day', max: '100K', price: 7.20 },
            { id: '5035', name: 'Spotlight Views [Premium] [Refill]', start: '0-6 Hrs', speed: '100K/Day', max: '200K', price: 12.28 }
        ]
    },
    'LinkedIn': {
        'Followers': [
            { id: '1653', name: 'Followers [Basic] [No Refill]', start: '0-12 Hrs', speed: '500/Day', max: '3K', price: 25.00 },
            { id: '3310', name: 'Followers [Premium] [Refill]', start: '0-6 Hrs', speed: '500/Day', max: '1K', price: 80.00 }
        ],
        'Connections': [
            { id: '1325', name: 'Connections [Basic] [No Refill]', start: '24 Hrs', speed: '100/Day', max: '1000', price: 100.00 },
            { id: '1325', name: 'Connections [Premium] [Refill]', start: '24 Hrs', speed: '500/Day', max: '1000', price: 150.00 }
        ],
        'Likes': [
            { id: '2062', name: 'Likes [Basic] [No Refill]', start: '0-12 Hrs', speed: '500/Day', max: '1K', price: 25.40 },
            { id: '2084', name: 'Likes [Premium] [Refill]', start: '0-12 Hrs', speed: '200/Day', max: '1K', price: 34.00 }
        ],
        'Comments': [
            { id: '2095', name: 'Comments [Basic] [No Refill]', start: '0-12 Hrs', speed: '500/Day', max: '1K', price: 31.60 },
            { id: '1330', name: 'Comments [Premium] [Refill]', start: '24 Hrs', speed: '5/Day', max: '200', price: 306.00 }
        ],
        'Endorsements': [
            { id: '2120', name: 'Endorsements [Basic] [No Refill]', start: '0-12 Hrs', speed: '500/Day', max: '1K', price: 30.00 },
            { id: '3315', name: 'Endorsements [Premium] [Refill]', start: '0-12 Hrs', speed: '500/Day', max: '1K', price: 50.00 }
        ],
        'Reshares': [
            { id: '2102', name: 'Reshares [Basic] [No Refill]', start: '0-12 Hrs', speed: '500/Day', max: '1K', price: 30.00 },
            { id: '2067', name: 'Reshares [Premium] [Refill]', start: '0-12 Hrs', speed: '500/Day', max: '1K', price: 34.60 }
        ]
    },
    'Spotify': {
        'Followers': [
            { id: '5637', name: 'Followers [Normal] [No Refill]', start: '0-12 Hrs', speed: '50K/Day', max: '1M', price: 2.85 },
            { id: '8515', name: 'Followers [Premium] [Refill]', start: '0-6 Hrs', speed: '50K/Day', max: '1M', price: 3.60 }
        ],
        'Plays / Streams': [
            { id: '1927', name: 'Plays / Streams [Normal] [No Refill]', start: '1-12 Hrs', speed: '3.5K/Day', max: '10M', price: 1.20 },
            { id: '1356', name: 'Plays / Streams [Premium] [Refill]', start: '1-24 Hrs', speed: '1K/Day', max: '1M', price: 2.40 }
        ],
        'Monthly Listeners': [
            { id: '1938', name: 'Monthly Listeners [Normal] [No Refill]', start: '1-12 Hrs', speed: '2K/Day', max: '75K', price: 2.10 },
            { id: '8528', name: 'Monthly Listeners [Premium] [Refill]', start: '1-12 Hrs', speed: '5K/Day', max: '50K', price: 3.20 }
        ],
        'Saves': [
            { id: '1934', name: 'Saves [Normal] [No Refill]', start: '1-12 Hrs', speed: '1.5K-3K/Day', max: '100K', price: 1.90 },
            { id: '1935', name: 'Saves [Premium] [Refill]', start: '1-12 Hrs', speed: '50K/Day', max: '1M', price: 2.40 }
        ],
        'Playlist Followers': [
            { id: '5603', name: 'Playlist Followers [Normal] [No Refill]', start: '1 Hr', speed: '50K/Day', max: '1M', price: 2.00 },
            { id: '1940', name: 'Playlist Followers [Premium] [Refill]', start: '1-12 Hrs', speed: '1.5K-3K/Day', max: '1M', price: 4.00 }
        ],
        'Podcast Plays': [
            { id: '8224', name: 'Podcast Plays [Normal] [No Refill]', start: '1-12 Hrs', speed: '10K/Day', max: '10M', price: 1.30 },
            { id: '6315', name: 'Podcast Plays [Premium] [Refill]', start: '1-12 Hrs', speed: '500/Day', max: '10M', price: 8.60 }
        ],
        'Artist Followers': [
            { id: '6537', name: 'Artist Followers [Normal] [No Refill]', start: '0-1 Hr', speed: '1M/Day', max: '100M', price: 2.00 },
            { id: '6537', name: 'Artist Followers [Premium] [Refill]', start: '0-6 Hrs', speed: '1M/Day', max: '100M', price: 9.00 }
        ]
    },
    'WhatsApp': {
        'Channels': [
            { id: '9282', name: 'Channel Followers (Boost)', start: '1-2 Hours', speed: '500/Day', max: '5K', price: 12.00 },
            { id: '9278', name: 'Channel Reactions', start: '0-1 Hour', speed: '2K/Day', max: '10K', price: 13.50 }
        ]
    }
};
