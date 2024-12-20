// Import K6 modules
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 2000 },  // Tăng số lượng VUs lên 2000 trong 1 phút
    { duration: '2m', target: 2000 },  // Giữ 2000 VUs trong 2 phút
    { duration: '5m', target: 10000 }, // Tăng số lượng VUs lên 10000 trong 5 phút
    { duration: '5m', target: 10000 }, // Giữ 10000 VUs trong 5 phút
    { duration: '5m', target: 20000 }, // Tăng số lượng VUs lên 20000 trong 5 phút
    { duration: '30m', target: 20000 },// Giữ 20000 VUs trong 30 phút
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

  // Scenario 1: Get Moment Dành cho bạn
  let momentRes = http.get('https://cmc-sn.emso.vn/api/v1/suggestions/moment?limit=3', {
    headers: { 'Authorization': randomToken }
  });

  check(momentRes, {
    'moment status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // Scenario 2: Get Watch Trang chủ
  let watchRes = http.get('https://cmc-sn.emso.vn/api/v1/suggestions/watch?limit=2', {
    headers: { 'Authorization': randomToken }
  });

  check(watchRes, {
    'watch status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // Sleep for a short duration to simulate real user behavior
  sleep(1);
}
