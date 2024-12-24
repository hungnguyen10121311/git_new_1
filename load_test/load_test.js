import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 2000 },  // Tăng lên 2000 VUs trong 1 phút
    { duration: '2m', target: 2000 },  // Giữ 2000 VUs trong 2 phút
    { duration: '5m', target: 5000 },  // Tăng lên 5000 VUs trong 5 phút
    { duration: '5m', target: 5000 },  // Giữ 5000 VUs trong 5 phút
    { duration: '5m', target: 10000 }, // Tăng lên 10000 VUs trong 5 phút
    { duration: '5m', target: 10000 }, // Giữ 10000 VUs trong 5 phút
    { duration: '5m', target: 20000 }, // Tăng lên 20000 VUs trong 5 phút
    { duration: '10m', target: 20000 },// Giữ 20000 VUs trong 10 phút
    { duration: '2m', target: 0 },     // Giảm xuống 0 VUs trong 2 phút
  ],
};

// Các token sử dụng trong các request
const tokens = [
  'Bearer RywajiSwzcSA2cgQElYjOktuvBt2duWDPQqBomK5cMo',
  'Bearer hgKONHVF209Sx67tz4EfZwnLNVyXXh_u-sVrC3veKQ8',
  'Bearer nfJgN2jv9ITtFEqYJm8ONe1PkoFi9as_qR6a95Yh-3M',
];

// Header chung sử dụng cho tất cả các request
const commonHeaders = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7,fr-FR;q=0.6,fr;q=0.5',
  'cache-control': 'no-cache',
  'origin': 'https://lab-fe.emso.vn',
  'pragma': 'no-cache',
  'priority': 'u=1, i',
  'referer': 'https://lab-fe.emso.vn/',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

export default function () {
  const randomToken = tokens[Math.floor(Math.random() * tokens.length)];

  // Scenario 1: Đăng nhập theo curl
  let loginRes = http.post('https://lab-sn.emso.vn/oauth/token', JSON.stringify({
    username: 'hoangthinh220402@gmail.com',
    password: 'ht01102001',
    grant_type: 'password',
    client_id: 'Ev2mh1kSfbrea3IodHtNd7aA4QlkMbDIOPr4Y5eEjNg',
    client_secret: 'f2PrtRsNb7scscIn_3R_cz6k_fzPUv1uj7ZollSWBBY',
    scope: 'write read follow',
  }), {
    headers: { ...commonHeaders, 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  }) || console.error(`Login API failed. Status: ${loginRes.status}, Body: ${loginRes.body}`);

  // Scenario 2: Lấy thông tin người dùng
  let userInfoRes = http.get('https://lab-sn.emso.vn/api/v1/me', {
    headers: { ...commonHeaders, 'Authorization': randomToken },
  });

  check(userInfoRes, {
    'user info status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  }) || console.error(`User Info API failed. Status: ${userInfoRes.status}, Body: ${userInfoRes.body}`);

  // Scenario 3: Xem timeline
  let timelineRes = http.get('https://lab-sn.emso.vn/api/v1/timelines/home?feed_key=395195&exclude_replies=true&limit=3', {
    headers: { ...commonHeaders, 'Authorization': randomToken },
  });

  check(timelineRes, {
    'timeline status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  }) || console.error(`Timeline API failed. Status: ${timelineRes.status}, Body: ${timelineRes.body}`);

  // Scenario 4: Đăng bài viết
  let postRes = http.post('https://lab-sn.emso.vn/api/v1/statuses', JSON.stringify({
    status: "This is a load testing post content.",
    visibility: "public",
  }), {
    headers: { ...commonHeaders, 'Authorization': randomToken, 'Content-Type': 'application/json' },
  });

  check(postRes, {
    'post status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  }) || console.error(`Post API failed. Status: ${postRes.status}, Body: ${postRes.body}`);

  sleep(1); // Sleep để mô phỏng hành vi thực
}
