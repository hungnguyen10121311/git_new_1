// Import K6 modules
import http from 'k6/http';
import { check, sleep } from 'k6';

// Import configuration
import { config } from 'file:///C:/Users/Admin/Desktop/k6_project/config.js'; // Đường dẫn file config

export let options = {
  stages: [
    { duration: '1s', target: 1 },  // Tăng số lượng VUs lên 2000 trong 1 phút
    // { duration: '2m', target: 2000 },  // Giữ 2000 VUs trong 2 phút
    // { duration: '5m', target: 10000 }, // Tăng số lượng VUs lên 10000 trong 5 phút
    // { duration: '5m', target: 10000 }, // Giữ 10000 VUs trong 5 phút
    // { duration: '5m', target: 20000 }, // Tăng số lượng VUs lên 20000 trong 5 phút
    // { duration: '30m', target: 20000 },// Giữ 20000 VUs trong 30 phút
    // { duration: '2m', target: 0 },     // Giảm số lượng VUs xuống 0 trong 2 phút
  ],
};

// Hàm chung để lấy headers với token ngẫu nhiên từ config.accounts_prod
function getHeaders() {
  // Chọn ngẫu nhiên một tài khoản từ config.accounts_prod
  const account = config.accounts_prod[Math.floor(Math.random() * config.accounts_prod.length)];
  
  return {
    'Authorization': account.token,  // Dùng token ngẫu nhiên
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  };
}

// Hàm chung gửi GET request với baseUrl từ config
function getRequest(endpoint) {
  const url = `${config.baseUrl}${endpoint}`;
  return http.get(url, { headers: getHeaders() });
}

export default function () {
  // Scenario 1: Get Moment Dành cho bạn
  let momentRes = getRequest('/api/v1/suggestions/moment?limit=3');
  check(momentRes, {
    'moment status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // Scenario 2: Get Watch Trang chủ
  let watchRes = getRequest('/api/v1/suggestions/watch?limit=2');
  check(watchRes, {
    'watch status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // Sleep for a short duration to simulate real user behavior
  sleep(1);
}
