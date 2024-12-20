// Import K6 modules
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 2000 },  // Tăng số lượng VUs lên 2000 trong 1 phút
    { duration: '2m', target: 2000 },  // Giữ 2000 VUs trong 2 phút
    { duration: '5m', target: 5000 },  // Tăng số lượng VUs lên 5000 trong 5 phút
    { duration: '5m', target: 5000 },  // Giữ 5000 VUs trong 5 phút
    { duration: '5m', target: 10000 }, // Tăng số lượng VUs lên 10000 trong 5 phút
    { duration: '5m', target: 10000 }, // Giữ 10000 VUs trong 5 phút
    { duration: '5m', target: 20000 }, // Tăng số lượng VUs lên 20000 trong 5 phút
    { duration: '10m', target: 20000 },// Giữ 20000 VUs trong 10 phút
    { duration: '2m', target: 0 },     // Giảm số lượng VUs xuống 0 trong 2 phút
  ],
};

const tokens = [
  'Bearer RywajiSwzcSA2cgQElYjOktuvBt2duWDPQqBomK5cMo',
  'Bearer hgKONHVF209Sx67tz4EfZwnLNVyXXh_u-sVrC3veKQ8',
  'Bearer nfJgN2jv9ITtFEqYJm8ONe1PkoFi9as_qR6a95Yh-3M',
];

export default function () {
  const randomToken = tokens[Math.floor(Math.random() * tokens.length)];

  // Scenario 1: Đăng nhập
  let loginRes = http.post('https://cmc-sn.emso.vn/api/v1/token', JSON.stringify({ 
    username: 'testuser', 
    password: 'password' 
  }), {
    headers: { 'Authorization': randomToken, 'Content-Type': 'application/json' }
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // Scenario 2: Lấy thông tin người dùng
  let userInfoRes = http.get('https://cmc-sn.emso.vn/api/v1/me', {
    headers: { 'Authorization': randomToken }
  });

  check(userInfoRes, {
    'user info status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // Scenario 3: Xem newfeed
  let feedRes = http.get('https://cmc-sn.emso.vn/api/v1/timelines', {
    headers: { 'Authorization': randomToken }
  });

  check(feedRes, {
    'feed status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // Scenario 4: Đăng bài viết
  let postRes = http.post('https://cmc-sn.emso.vn/api/v1/status', JSON.stringify({ 
    title: 'Test Post', 
    content: 'This is a load testing post content.' 
  }), {
    headers: { 'Authorization': randomToken, 'Content-Type': 'application/json' }
  });

  check(postRes, {
    'post status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // Sleep for a short duration to simulate real user behavior
  sleep(1);
}
