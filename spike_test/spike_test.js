import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from 'file:///C:/Users/Admin/Desktop/k6_project/config.js'; // Đường dẫn file

export let options = {
  stages: [
    { duration: '1m', target: 1000 }, // Tăng tải lên 1000 RPS trong 1 phút
    { duration: '1m', target: 10000 }, // Tăng tải đột ngột lên 10,000 RPS trong 1 phút
    { duration: '3m', target: 10000 }, // Giữ tải ở 10,000 RPS trong 3 phút
    { duration: '1m', target: 0 }, // Giảm tải về 0 trong 1 phút
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% các request phải có thời gian phản hồi dưới 1 giây
    'http_req_failed': ['rate<0.01'], // Tỷ lệ lỗi phải dưới 1%
  },
};

const BASE_URL = `https://prod-marketplace.emso.vn/api/v1/suggestions/product?limit=10&offset=20`;
const TOKENS = config.accounts_prod.map(account => account.token);

export default function () {
  // Chọn ngẫu nhiên một token từ danh sách
  const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];

  const headers = {
    'Authorization': token,
    ...config.commonHeaders,
  };

  // Gửi request đến endpoint
  const res = http.get(BASE_URL, { headers });

  // Kiểm tra response có mã 200 hay không
  const isStatus200 = check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Log thông tin chi tiết về response
  console.log(`Request: ${BASE_URL}`);
  console.log(`Status: ${res.status}`);
  console.log(`Response time: ${res.timings.duration} ms`);
  // if (isStatus200) {
  //   console.log(`Response body: ${res.body}`);
  // } else {
  //   console.error(`Request failed with status: ${res.status}`);
  // }

  // Nghỉ ngắn giữa các request để tránh bị trùng lặp quá nhanh
  sleep(1);
}
