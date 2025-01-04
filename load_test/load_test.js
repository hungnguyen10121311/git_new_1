import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config.js';

// Import configuration
// import { config } from 'config.js';

export let options = {
  scenarios: {
    constant_rps: {
      executor: 'constant-arrival-rate',
      rate: 280, // 1000 requests mỗi giây
      timeUnit: '1s', // 1 giây
      duration: '1m', // Chạy trong 1 phút
      preAllocatedVUs: 200, // Số lượng VUs ban đầu
      maxVUs: 1000, // Tối đa số VUs
    },
  },
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

// Hàm chung gửi POST request với baseUrl từ config
function postRequest(endpoint, body) {
  const url = `${config.baseUrl}${endpoint}`;
  return http.post(url, body, { headers: getHeaders() });
}

// Hàm chung gửi GET request với baseUrl từ config
function getRequest(endpoint) {
  const url = `${config.baseUrl}${endpoint}`;
  return http.get(url, { headers: getHeaders() });
}

export default function () {
  // Scenario 1: Đăng nhập (Comment lại vì không cần thiết cho thử nghiệm hiện tại)
  // let loginRes = postRequest('/oauth/token', JSON.stringify({
  //   username: account.username,
  //   password: account.password,
  //   grant_type: 'password',
  //   client_id: 'Ev2mh1kSfbrea3IodHtNd7aA4QlkMbDIOPr4Y5eEjNg',
  //   client_secret: 'f2PrtRsNb7scscIn_3R_cz6k_fzPUv1uj7ZollSWBBY',
  //   scope: 'write read follow',
  // }));
  // check(loginRes, {
  //   'login status is 200': (r) => r.status === 200,
  //   'response time is less than 2s': (r) => r.timings.duration < 2000,
  // }) || console.error(`Login API failed. Status: ${loginRes.status}, Body: ${loginRes.body}`);

  // Scenario 2: Lấy thông tin người dùng
  let userInfoRes = getRequest('/api/v1/me');
  check(userInfoRes, {
    'user info status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  }) || console.error(`User Info API failed. Status: ${userInfoRes.status}, Body: ${userInfoRes.body}`);

  // // Scenario 3: Xem timeline
  // let timelineRes = getRequest('/api/v1/timelines/home?feed_key=395195&exclude_replies=true&limit=3');
  // check(timelineRes, {
  //   'timeline status is 200': (r) => r.status === 200,
  //   'response time is less than 2s': (r) => r.timings.duration < 2000,
  // }) || console.error(`Timeline API failed. Status: ${timelineRes.status}, Body: ${timelineRes.body}`);

  // // Scenario 4: Đăng bài viết
  // let postRes = postRequest('/api/v1/statuses', JSON.stringify({
  //   status: "This is a load testing post content.",
  //   visibility: "public",
  // }));
  // check(postRes, {
  //   'post status is 200': (r) => r.status === 200,
  //   'response time is less than 2s': (r) => r.timings.duration < 2000,
  // }) || console.error(`Post API failed. Status: ${postRes.status}, Body: ${postRes.body}`);

  sleep(1); // Sleep để mô phỏng hành vi thực
}
