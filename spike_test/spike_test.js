// K6 script for Spike Test on Load Balancer
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 }, // Tăng tải lên 1000 RPS trong 1 phút
    { duration: '1m', target: 1000 }, // Tăng tải đột ngột lên 10,000 RPS trong 1 phút
    { duration: '3m', target: 1000 }, // Giữ tải ở 10,000 RPS trong 3 phút
    { duration: '1m', target: 0 }, // Giảm tải về 0 trong 1 phút
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% các request phải có thời gian phản hồi dưới 1 giây
    'http_req_failed': ['rate<0.01'], // Tỷ lệ lỗi phải dưới 1%
  },
};

const BASE_URL = 'https://cmc-marketplace.emso.vn/api/v1/suggestions/product?limit=10&offset=10';

// Danh sách các token để luân phiên sử dụng
const TOKENS = [
  'Bearer RywajiSwzcSA2cgQElYjOktuvBt2duWDPQqBomK5cMo',
  'Bearer hgKONHVF209Sx67tz4EfZwnLNVyXXh_u-sVrC3veKQ8',
  'Bearer nfJgN2jv9ITtFEqYJm8ONe1PkoFi9as_qR6a95Yh-3M'
];

export default function () {
  // Chọn ngẫu nhiên một token từ danh sách
  const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];

  const headers = {
    'Authorization': token,
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  };

  // Gửi request đến endpoint
  const res = http.get(BASE_URL, { headers });

  // Kiểm tra response có mã 200 hay không
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Nghỉ ngắn giữa các request để tránh bị trùng lặp quá nhanh
  sleep(1);
}
